'use client'

import Button from '@/components/Button';
import useLocalStorage from '@/hook/useLocalStorage';
import { Cart, Option, Product } from '@/types/product';
import { useModelStore } from '@/zustand/useModel';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ReactNode, useRef, useState } from 'react';

interface HorizontalLayoutProps {
  params: {
    model: string;
    option: string;
  };
  modelData: Product | null;
  optionData: Option[];
}

const SERVER = process.env.NEXT_PUBLIC_API_SERVER;

// 3번레이아웃_기본 default 옵션 사진 가로
export default function HorizontalLayout({ params, modelData, optionData }: HorizontalLayoutProps) {
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
  const defaultItemImage = defaultItems[0].image ? SERVER + defaultItems[0].image.path : '';

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

    // setOptionState({
    //   node: list,
    //   prevPrice: optionState.newPrice,
    //   newPrice: newPrice,
    //   imageSource: newImage,
    //   optionText: textOptionRef.current.get('item') || '',
    // });
  };

  const isClicked = (item: string) => clickedOptionRef.current.has(item) ? 'border-[3px] border-slate-300' : '';


  const { steps } = useModelStore();
  const currentStep = steps.indexOf(optionName);
  const nextStep = steps[currentStep + 1];
  const prevStep = steps[currentStep - 1] === 'detail' ? '' : steps[currentStep - 1];

  const clickButton = (e: React.MouseEvent<HTMLButtonElement>, direction?: string) => {
    e.preventDefault();
    const step = direction === 'prev' ? prevStep : nextStep;
    router.push(`/models/${params.model}/${step}`);
    // setValue({
    //   model: modelName,
    //   price: optionState.newPrice,
    // });
  };

  return (
    <>
      <section className="h-screen relative">
        <article className="flex absolute items-center w-[1440px] right-[50px] top-[200px]">
          <div className="flex flex-col mr-[40px]">
            <figure className="w-[650px] h-[325px] relative">
              <Image src={defaultItemImage} fill sizes='100%' className="w-full" alt="" />
            </figure>
            <h4 className="mb-[20px] self-center mt-[20px]">
              상기 이미지는 차량의 대표 이미지로 적용되어 있습니다.
            </h4>
          </div>

          <article className="w-[1200px] h-[400px] overflow-scroll border-t-[1px] border-b-[1px]  border-[#a4a4a4]">
            <table className="w-full">
              <tbody>
                <tr className="flex items-center text-[30px] gap-x-[86px] border-t-[1px] border-[#a4a4a4] py-[15px] pl-[15px]">
                  <td className="font-Hyundai-sans" data-value="">
                    (옵션명)
                  </td>
                  <td className="font-Hyundai-sans" data-value="">
                    (옵션1)
                  </td>
                </tr>
                <tr className="flex items-center text-[30px] gap-x-[86px] border-t-[1px] border-[#a4a4a4] py-[15px] pl-[15px]">
                  <td className="font-Hyundai-sans" data-value="">
                    (옵션명)
                  </td>
                  <td className="font-Hyundai-sans" data-value="">
                    (옵션2)
                  </td>
                </tr>
                <tr className="flex items-center text-[30px] gap-x-[86px] border-t-[1px] border-[#a4a4a4] py-[15px] pl-[15px]">
                  <td className="font-Hyundai-sans" data-value="">
                    (옵션명)
                  </td>
                  <td className="font-Hyundai-sans" data-value="">
                    (옵션3)
                  </td>
                </tr>
                <tr className="flex items-center text-[30px] gap-x-[86px] border-t-[1px] border-[#a4a4a4] py-[15px] pl-[15px]">
                  <td className="font-Hyundai-sans" data-value="">
                    (옵션명)
                  </td>
                  <td className="font-Hyundai-sans" data-value="">
                    (옵션4)
                  </td>
                </tr>
                <tr className="flex items-center text-[30px] gap-x-[86px] border-t-[1px] border-[#a4a4a4] py-[15px] pl-[15px]">
                  <td className="font-Hyundai-sans" data-value="">
                    (옵션명)
                  </td>
                  <td className="font-Hyundai-sans" data-value="">
                    (옵션5)
                  </td>
                </tr>
                <tr className="flex items-center text-[30px] gap-x-[86px] border-t-[1px] border-[#a4a4a4] py-[15px] pl-[15px]">
                  <td className="font-Hyundai-sans" data-value="">
                    (옵션명)
                  </td>
                  <td className="font-Hyundai-sans" data-value="">
                    (옵션6)
                  </td>
                </tr>
                {/* 가장 마지막 요소의 class에 border-b-[1px] 클래스를 넣어주세요 */}
                <tr className="flex items-center text-[30px] gap-x-[86px] border-t-[1px] border-[#a4a4a4] py-[15px] pl-[15px]">
                  <td className="font-Hyundai-sans" data-value="">
                    (옵션명)
                  </td>
                  <td className="font-Hyundai-sans" data-value="">
                    (옵션7)
                  </td>
                </tr>
              </tbody>
            </table>
          </article>
        </article>

        <div className="grid grid-cols-[60px_60px] grid-rows-[50px] gap-x-[20px] absolute top-[620px] left-[80px]">
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
        
        <article className="w-full absolute bottom-[120px] flex items-end z-10 justify-center ">

          {/* <div className="flex gap-x-[20px]">
            <Button size="custom" onClick={(e) => clickButton(e, 'prev')}>
              이전
            </Button>
            <Button color="black" bgColor="white" size="custom" onClick={clickButton}>
              다음
            </Button>
          </div> */}
         

          <div className="absolute right-12">
            <aside className="font-Hyundai-sans border-[1px] border-[#666666] flex flex-col justify-center px-[30px] pt-[10px]">
              <p className="text-[15px] text-[#a4a4a4]">예상가격</p>
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
