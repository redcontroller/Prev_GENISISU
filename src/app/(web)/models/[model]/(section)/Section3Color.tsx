import { OptionItem } from '@/types/product';
import ModelColor from '../ModelColor';

interface Section3Color {
  modelName: string;
  optionData: OptionItem[];
}

export default function Section3Color({ modelName, optionData }: Section3Color) {
  return <ModelColor exterior={optionData} modelName={modelName} />;
}
