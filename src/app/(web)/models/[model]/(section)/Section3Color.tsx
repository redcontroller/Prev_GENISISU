import { OptionItem } from '@/types/product';
import ModelColor from '../ModelColor';

interface Section3Color {
  modelIndex: string;
  optionData: OptionItem[];
}

export default function Section3Color({ modelIndex, optionData }: Section3Color) {
  return <>{optionData && <ModelColor exterior={optionData} modelIndex={modelIndex} />}</>;
}
