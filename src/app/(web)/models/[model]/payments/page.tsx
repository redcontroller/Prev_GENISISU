import { fetchOptionExterior, fetchOptions, fetchProducts } from "@/data/fetch/productFetch";
import PaymentsAction from "./PaymentsAction";
import { ModelOption } from "@/types/product";

interface VehicleInfo {
  name:string,
  image:string,
}

export default async function Payments () {

  const vehicleOriginData = await fetchProducts();
  const data = await fetchOptions();
  const optionOriginData = data.map(item => item.extra.option)
  // console.log('데이터확인-----',vehicleOriginData)
  // console.log('데이터길이확인-----',modelDataOption.length)

  // const exteriorData = optionOriginData.filter((item)=>item.exterior)
  const exteriorOriginData = await fetchOptionExterior('exterior') || [];
  const exteriorData = exteriorOriginData[0]

  
  const optionData = optionOriginData.filter((item)=>!item.exterior)
  


  const vehicleData = vehicleOriginData.filter(item => item.extra.category.includes('vehicle'))
  const vehicleInfo : VehicleInfo[] = vehicleData.map(item => ({
    name:item.name,
    image:item.mainImages[2].path,
  }))
  // console.log('비휘클확인:::',vehicleData)
  // console.log('확인:::',vehicleInfo)

  // OptionExterior 타입지정하고 exterior도 넘겨줘야함 총 3개 넘겨줘야함
  return(
    <PaymentsAction vehicleInfo={vehicleInfo} optionData={optionData} exteriorData={exteriorData}/>
  )
}
