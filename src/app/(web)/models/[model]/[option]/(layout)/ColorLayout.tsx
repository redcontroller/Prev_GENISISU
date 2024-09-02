'use client';

import Button from '@/components/Button';
import useLocalStorage from '@/hook/useLocalStorage';
import { Cart, Option, OptionDetail, OptionItem, Product } from '@/types/product';
import { useModelStore } from '@/zustand/useModel';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect, useRef, useState } from 'react';

interface ColorLayoutProps {
  params: {
    model: string;
    option: string;
  };
  modelData: Product | null;
  optionData: Option[];
}

const SERVER = process.env.NEXT_PUBLIC_API_SERVER;

// 2번레이아웃_컬러칩 옵션
export default function ColorLayout({ params, modelData, optionData }: ColorLayoutProps) {
  const router = useRouter();
  const optionName = params.option;
  const modelName = modelData?.name || '';
  const initialPrice = modelData?.price || 0;
  const modelOptionData = optionData[0].extra.option[optionName][modelName];

  // console.log(modelOptionData);
  // console.log(modelOptionData.length);

  const [storedValue, setValue] = useLocalStorage<Cart>('cart', {
    model: modelName,
    price: initialPrice,
  });

  const defaultData = modelOptionData[0];
  const defaultItems = defaultData.items || [];
  const defaultGroupName = defaultData.topText;
  const defaultItemName = defaultItems[0].name;
  const defaultItemImage = defaultItems[0].images ? SERVER + defaultItems[0].images[1].path : '';

  const clickedOptionRef = useRef<Set<string>>(new Set([defaultGroupName, defaultGroupName + defaultItemName]));
  const textOptionRef = useRef<Map<string, string>>(
    new Map([
      ['group', defaultGroupName],
      ['item', defaultItemName],
    ])
  );

  const [optionState, setOptionState] = useState<{
    node: ReactNode;
    prevPrice: number;
    newPrice: number;
    imageSource: string;
    optionText: string;
  }>({
    node: null,
    prevPrice: storedValue.price,
    newPrice: storedValue.price,
    imageSource: defaultItemImage,
    optionText: defaultItemName,
  });

  const handleOptionClick = (
    optionGroup: string,
    optionItem: string,
    optionPrice: number,
    optionImage: string
  ) => {
    clickedOptionRef.current.clear();
    clickedOptionRef.current.add(optionGroup);
    clickedOptionRef.current.add(optionGroup + optionItem);
    const newImage = optionImage;
    // 로컬스토리지 기준값: storedValue.price
    const newPrice = optionPrice === 0 ? storedValue.price : storedValue.price + optionPrice;
    textOptionRef.current.set('group', optionGroup);
    textOptionRef.current.set('item', optionItem);

    setOptionState({
      node: list,
      prevPrice: optionState.newPrice,
      newPrice: newPrice,
      imageSource: newImage,
      optionText: textOptionRef.current.get('item') || '',
    });
  };

  const isClicked = (item: string) => clickedOptionRef.current.has(item) ? 'border-[3px] border-slate-300' : '';

  const generateOptionButton = (data: OptionItem): ReactNode => {
    const groupName = data.topText;
    const items = data.items || [];
    return items.map((item: OptionDetail, index: number) => {
      // const isBolder = index === lastIndex ? 'border-b-[1px]' : '';
      const { name, price = 0, images = [] } = item;
      // console.log(name);
      const colorChipImage = SERVER + images[0].path;
      const vehicleImage = SERVER + images[1].path;
      // console.log(colorChipImage);
      return (
        <li
          key={name}
          onClick={() => handleOptionClick(groupName, name, price, vehicleImage)}
          className="w-[95px] h-[50px]"
        >
          <figure className={`w-[95px] h-[50px] relative ${isClicked(groupName + name)}`}>
            <Image src={colorChipImage} fill sizes="100%" alt={`${name}`} />
          </figure>
        </li>
      );
    });
  };

  const isOptionActive = (option: string) =>
    clickedOptionRef.current.has(option) ? 'text-white' : 'text-[#666666]';

  const list = modelOptionData.map((optionGroup) => {
    const groupName = optionGroup.topText;
    const refItem = textOptionRef.current.get('item') || '';
    const itemName = textOptionRef.current.get('group') === groupName ? refItem : '';
    const optionData = generateOptionButton(optionGroup);
    return (
      <table key={groupName}>
        <tbody>
          {/* 그룹 타이틀 */}
          <tr>
            <td className={`pl-[15px] ${isOptionActive(groupName)}`}>{groupName}</td>
          </tr>
          {/* 옵션 텍스트 */}
          <tr className="flex items-center text-[30px] gap-x-[86px] border-t-[1px] border-[#a4a4a4] pt-[30px] pl-[15px]">
            <td className={`font-Hyundai-sans ${isOptionActive(groupName + itemName)}`}>{itemName}</td>
            <td>
              {/* 옵션 버튼 생성 */}
              <ul className="flex gap-x-[20px]">{optionData}</ul>
            </td>
          </tr>
        </tbody>
      </table>
    );
  });

  const { steps } = useModelStore();
  const currentStep = steps.indexOf(optionName);
  const nextStep = steps[currentStep + 1];
  const prevStep = steps[currentStep - 1] === 'detail' ? '' : steps[currentStep - 1];

  const clickButton = (e: React.MouseEvent<HTMLButtonElement>, direction?: string) => {
    e.preventDefault();
    const step = direction === 'prev' ? prevStep : nextStep;
    router.push(`/models/${params.model}/${step}`);
    setValue({
      model: modelName,
      price: optionState.newPrice,
    });
  };

  useEffect(() => {
    setOptionState((prevState) => ({
      ...prevState,
      node: list,
    }));
  }, []);

  return (
    <>
      <section className="h-screen relative flex flex-col-reverse">
        <article className="flex flex-col absolute items-center w-[1440px] right-[50px] top-[50px]">
          <figure className="w-[700px] h-[350px] relative">
            <Image
              src={optionState.imageSource}
              fill
              sizes="100%"
              alt=""
              className="absolute top-0 left-0"
              priority
            />
          </figure>
          <h4>상기 이미지는 차량의 대표 이미지로 적용되어 있습니다.</h4>
          {list}
        </article>

        <div className="grid grid-cols-[60px_60px] grid-rows-[50px] gap-x-[20px] absolute top-[620px] left-[80px]">
            {/* <Button size="custom" onClick={(e) => clickButton(e, 'prev')}>
              이전
            </Button>
            <Button color="black" bgColor="white" size="custom" onClick={clickButton}>
              다음
            </Button> */}
            <button className='bg-black border-[0.5px] border-white w-full h-full' onClick={(e) => clickButton(e, 'prev')}>
              <figure className='relative w-full h-[75%]'>
                <Image className='absolute top-0 left-0' src="/images/btn_prev.png" alt="버튼 좌측 이미지" fill style={{objectFit:"contain"}}/>
              </figure>
            </button>
            <button className='bg-white w-full h-full' onClick={clickButton}>
              <figure className='relative w-full h-[75%]'>
                <Image className='absolute top-0 left-0' src="/images/btn_next_b.png" alt="버튼 좌측 이미지" fill style={{objectFit:"contain"}}/>
              </figure>
            </button>
        </div>

        <article className="w-full absolute left-0 bottom-[120px] flex items-end z-10 justify-center ">
          <div className="absolute right-12">
            <aside className="font-Hyundai-sans border-[1px] border-[#666666] flex flex-col justify-center px-[30px] pt-[10px]">
              <p className="text-[15px] text-[#a4a4a4]">예상 가격</p>
              <span className="text-[30px] font-bold mt-[-10px]">
                {optionState.newPrice.toLocaleString('ko-KR')}
                <span className="text-[20px]">원</span>
              </span>
            </aside>
          </div>
        </article>
      </section>
    </>
  );
}
