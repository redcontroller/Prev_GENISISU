'use client';

import { OptionDetail, OptionExterior } from '@/types/product';
import { useModelStore } from '@/zustand/useModel';
import Image from 'next/image';
import React, { ReactNode, useEffect, useRef, useState } from 'react';

const SERVER = process.env.NEXT_PUBLIC_API_SERVER;

interface ModelColorProps {
  optionData: OptionExterior;
  modelIndex: string;
}

const ModelColor: React.FC<ModelColorProps> = ({ optionData, modelIndex }) => {
  const { items } = useModelStore();
  const modelName = items[Number(modelIndex) - 1];
  // console.log(modelName);

  const exterior = optionData!.extra.option.exterior;
  // console.log(exterior);
  const [groupName1, groupName2] = [Object.keys(exterior)[1], Object.keys(exterior)[2]];

  const defaultGroup = groupName1;
  const defaultColorText: string = exterior[groupName1].colors[modelName][0].name;
  // console.log(defaultGroup);
  const defaultColor = defaultColorText.substring(0, defaultColorText.indexOf('['));
  const defaultImage: string = SERVER + exterior[groupName1].colors[modelName][0].images[1].path;

  const [colorState, setColorState] = useState<{ node: ReactNode; imageSource: string }>({
    node: null,
    imageSource: defaultImage,
  });
  const clickedGroupRef = useRef<Set<string>>(new Set([defaultGroup]));
  const clickedColorRef = useRef<Set<string>>(new Set([defaultColor]));

  let [groupKR1, groupKR2] = ['', ''];
  if ('glossy' in exterior) {
    groupKR1 = '글로시';
    groupKR2 = 'matte' in exterior ? '매트' : '';
  } else if ('matte' in exterior) {
    groupKR1 = '매트';
  }

  const handleGroupClick = (groupName: string) => {
    // 클릭한 버튼에 text-white 클래스 추가
    clickedGroupRef.current.clear();
    clickedGroupRef.current.add(groupName);

    const colorArray = exterior[groupName].colors[modelName];
    const newImage = SERVER + colorArray[0].images[1].path;
    const text = colorArray[0].name;
    const colorName = text.substring(0, text.indexOf('['));

    if (groupName === 'glossy') {
      clickedColorRef.current.clear();
      clickedColorRef.current.add(colorName);
      setColorState({
        node: generateColorButton(groupName1),
        imageSource: newImage,
      });
    } else {
      clickedColorRef.current.clear();
      clickedColorRef.current.add(colorName);
      setColorState({
        node: generateColorButton(groupName2),
        imageSource: newImage,
      });
    }
  };
  const isColorActive = (color: string) => (clickedColorRef.current.has(color) ? 'text-white' : '');
  const isGroupActive = (group: string) => (clickedGroupRef.current.has(group) ? 'text-white' : '');
  const handleColorClick = (colorName: string, groupName: string, colorIndex: number) => {
    // 클릭한 버튼에 text-white 클래스 추가
    // if (clickedColorRef.current.has(name)) {
    //   clickedColorRef.current.delete(name);
    // } else {
    //   clickedColorRef.current.add(name)에
    // }
    clickedColorRef.current.clear();
    clickedColorRef.current.add(colorName);
    const newImage = SERVER + exterior[groupName].colors[modelName][colorIndex].images[1].path;
    setColorState(() => ({
      node: generateColorButton(groupName),
      imageSource: newImage,
    }));
  };

  const generateColorButton = (groupName: string): ReactNode => {
    return exterior[groupName].colors[modelName].map((color: OptionDetail, colorIndex: number) => {
      const text = color.name;
      // const colorCode = colorText.substring(colorText.indexOf("[")); // [sss]
      const colorName = text.substring(0, text.indexOf('[')); // 우유니 화이트
      return (
        <li
          key={colorName}
          className={`cursor-pointer hover:cursor-pointer ${isColorActive(colorName)}`}
          onClick={() => handleColorClick(colorName, groupName, colorIndex)}
        >
          {colorName}
        </li>
      );
    });
  };

  useEffect(() => {
    setColorState((prevState) => ({
      ...prevState,
      node: generateColorButton(groupName1),
    }));
  }, []);

  return (
    <section className="min-h-screen bg-slate-900 relative p-[160px]">
      <nav className="absolute z-10 text-[#666666] inline-flex flex-col gap-y-[40px]">
        <ul className="text-[30px] flex gap-x-[24px]">
          <li
            className={`cursor-pointer hover:cursor-pointer ${isGroupActive(groupName1)}`}
            onClick={() => handleGroupClick(groupName1)}
          >
            {groupKR1}
          </li>
          {exterior[groupName2].colors[modelName].length !== 0 ? (
            <li
              className={`cursor-pointer hover:cursor-pointer ${isGroupActive(groupName2)}`}
              onClick={() => handleGroupClick(groupName2)}
            >
              {groupKR2}
            </li>
          ) : null}
        </ul>
        <ul className="text-[24px] text-[#666666] flex flex-col gap-y-[10px]">{colorState.node}</ul>
      </nav>
      <figure className="absolute top-0 w-full h-full">
        {colorState.imageSource !== '' ? (
          <Image className="w-full" fill sizes="100%" src={colorState.imageSource} alt="" />
        ) : null}
      </figure>
      <div className="absolute bottom-0 left-0 w-full h-[300px] bg-gradient-to-b from-[#6A6C72] to-[#303135] opacity-30 blur" />
    </section>
  );
};

export default ModelColor;
