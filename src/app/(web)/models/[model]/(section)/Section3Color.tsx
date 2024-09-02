import { OptionExterior } from '@/types/product';
import ModelColor from '../ModelColor';

interface Section3Color {
  modelIndex: string;
  optionData: OptionExterior | null;
}

export default function Section3Color({ modelIndex, optionData }: Section3Color) {
  return <>{optionData && <ModelColor optionData={optionData} modelIndex={modelIndex} />}</>;
}
