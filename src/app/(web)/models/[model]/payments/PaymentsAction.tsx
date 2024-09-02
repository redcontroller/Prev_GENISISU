'use client';

import useLocalStorage from "@/hook/useLocalStorage";
import { ModelOption, OptionExterior } from "@/types/product";
import PortOne from "@portone/browser-sdk/v2";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

interface PaymentsActionProps {
  vehicleInfo : {name:string, image:string}[],
  optionData : {[item: string]: ModelOption;}[],
  exteriorData : OptionExterior;
}

export default function PaymentsAction (

  {vehicleInfo, optionData, exteriorData}: PaymentsActionProps) {

  const [storedValue, setValue] = useLocalStorage('cart', {
    model:'',
    price:0,
    engine:'',
    drivetrain:'',
    passenger:'',
    exterior:'',
    interior:'',
    garnish:'',
    wheel:'',
    add:'',
  })

  const route = useRouter();
  const tbodyRef = useRef<HTMLTableSectionElement>(null)
  const tbodyLengthRef = useRef(0)

  useEffect(()=>{
    if (tbodyRef.current) {
      tbodyLengthRef.current = tbodyRef.current.querySelectorAll('tr').length -1;
    }
  },[])


  const optionExterior = exteriorData.extra.option.exterior.glossy.colors[`${storedValue.model}`]
  const optionEngine = optionData[0].engine[`${storedValue.model}`]
  const optionDrivetrain = optionData[1].drivetrain[`${storedValue.model}`]
  const optionPassenger = optionData[2].passenger[`${storedValue.model}`]
  const optionInterior = optionData[3].interior[`${storedValue.model}`]
  const optionGarnish = optionData[4].garnish[`${storedValue.model}`]
  const optionWheel = optionData[5].wheel[`${storedValue.model}`]
  // const optionAdd = optionData[0].add[`${storedValue.model}`]

  const title = storedValue.model && storedValue.model?.split('-').join(' ').toUpperCase();
  const price = Number(storedValue.price);
  const SERVER : string = process.env.NEXT_PUBLIC_API_SERVER;
  const STOREID : string = process.env.NEXT_PUBLIC_API_SERVER;
  const CHANNELKEY : string = process.env.NEXT_PUBLIC_API_SERVER;
  const imageMatch = vehicleInfo.filter(item => item.name === storedValue.model)[0]

  // 결제이벤트 연결
  const payClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const response = await PortOne.requestPayment({
      // Store ID 설정
      storeId: "store-e2dd6932-fc37-43ff-959c-83336c40ca8e",
      // 채널 키 설정
      channelKey: "channel-key-8bd7c279-b766-4868-af61-4de2abf530c4",
      paymentId: `payment-${crypto.randomUUID()}`,
      // --- 여기까지 건드리면 안됌
      orderName: `${title}`,
      totalAmount: Number(`${price}`),
      currency: "CURRENCY_KRW",
      payMethod: "CARD",
    });
    
    if (response?.code != null) {
      // 오류 발생
      return alert(response.message);
    } else {
        const notified = await fetch("", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // paymentId와 주문 정보를 서버에 전달합니다
          body: JSON.stringify({
            paymentId: response?.paymentId,
            model:`${title}`,
            price: Number(`${price}`)
            // 주문 정보...
          }),
        });
        route.push('/models/paymentsComplete')
        return (
          alert('결제가 완료되었습니다')
        )
      }
  }

  return(
    <section>
    <div className="ml-[300px] pt-[250px] grid grid-cols-2 gap-x-[80px]">
      {/* 옵션 선택 정보 */}
      <div className="flex flex-col gap-y-[20px]">
        <article className="flex items-end gap-x-[8px]">
          <h2 className="text-[40px] mb-[-3px]">김모건</h2><h3 className="text-[30px]">님께서 선택하신 옵션</h3>
        </article>

        {/* 차량 정보 */}
        <article className="border-t-[1px] border-[#a4a4a4]">
          <h3 className="text-[25px] font-bold mt-[27px]">차량정보</h3>
          <table className="mt-[27px] text-[15px]">
            <tbody>
              <tr className="grid grid-cols-[80px_auto] gap-x-[60px] mb-[15px]">
                <th className="text-right">모델명</th>
                <td>{title}</td>
              </tr>
              
              <tr className="grid grid-cols-[80px_auto] gap-x-[60px] mb-[15px]">
                <th className="text-right">색상</th>
                <td>
                  <table className="w-full">
                    <tbody className="flex flex-col gap-y-[10px] h-full">
                      <tr className="grid grid-cols-[90px_4fr_minmax(100px,auto)] gap-x-[5px] text-nowrap">
                        <th className="bg-white text-black mr-[15px] rounded-[10px] font-normal">외장 컬러</th>
                        <td className="flex gap-x-[10px]">
                          <figure className="w-[200px] h-full relative border-[1px] border-[#fff]">
                            <Image src={optionExterior && SERVER + optionExterior?.[0].images?.[0].path} fill 
                            style={{objectFit:"cover"}} alt="" className="absolute top-0 left-0"
                            ></Image>
                          </figure>
                          <span>| {optionExterior?.[0].name}</span>
                        </td>
                        <td className="text-right">{optionExterior && optionExterior?.[0].price?.toLocaleString()}원</td>
                      </tr>

                      <tr className="grid grid-cols-[90px_4fr_minmax(100px,auto)] gap-x-[5px] text-nowrap">
                        <th className="bg-white text-black mr-[15px] rounded-[10px] font-normal">내장 컬러</th>
                        <td className="flex gap-x-[10px]">
                          <figure className="w-[200px] h-full bg-white relative border-[1px] border-[#fff]">
                            <Image src={optionInterior && SERVER + optionInterior?.[0].items?.[0].images?.[0].path} fill 
                              style={{objectFit:"cover"}} alt="" className="absolute top-0 left-0"
                              ></Image>
                          </figure>
                          <span>| {optionInterior?.[0].items?.[0].name}</span>
                        </td>
                        <td className="text-right">{optionInterior?.[0].items?.[0].price?.toLocaleString()}원</td>
                      </tr>
  
                    </tbody>
                  </table>
                </td>
                
              </tr>
  

              <tr className="grid grid-cols-[80px_auto] gap-x-[60px] mb-[15px]">
                <th className="text-right">옵션</th>
                <td>
                  <table className="w-full">
                    <tbody className="flex flex-col gap-y-[10px]" ref={tbodyRef}>
                      <tr className="grid grid-cols-[90px_4fr_minmax(100px,auto)] gap-x-[5px]">
                        <th className="bg-white text-black mr-[15px] rounded-[10px] font-normal">엔진 타입</th>
                        <td className="text-left"><span className="w-[50px] mr-[20px] ">| 기본 |</span>{optionEngine?.[0].topText}</td>
                        <td className="text-right">{optionEngine?.[0].price.toLocaleString()}원</td>
                      </tr>

                      <tr className="grid grid-cols-[90px_4fr_minmax(100px,auto)] gap-x-[5px]">
                        <th className="bg-white text-black mr-[15px] rounded-[10px] font-normal">구동 타입</th>
                        <td className="text-left"><span className="w-[50px] mr-[20px]">| 기본 |</span>{optionDrivetrain?.[0].topText}</td>
                        <td className="text-right">{optionDrivetrain?.[0].price.toLocaleString()}원</td>
                      </tr>

                      <tr className="grid grid-cols-[90px_4fr_minmax(100px,auto)] gap-x-[5px]">
                        <th className="bg-white text-black mr-[15px] rounded-[10px] font-normal">시트 구성</th>
                        <td className="text-left"><span className="w-[50px] mr-[20px]">| 기본 |</span>{optionPassenger?.[0].topText}</td>
                        <td className="text-right">{optionPassenger?.[0].price.toLocaleString()}원</td>
                      </tr>

                      <tr className="grid grid-cols-[90px_4fr_minmax(100px,auto)] gap-x-[5px]">
                        <th className="bg-white text-black mr-[15px] rounded-[10px] font-normal">내장 가니쉬</th>
                        <td className="text-left"><span className="w-[50px] mr-[20px]">| 기본 |</span>{optionGarnish?.[0].topText}</td>
                        <td className="text-right">{optionGarnish?.[0].price.toLocaleString()}원</td>
                      </tr>

                      <tr className="grid grid-cols-[90px_4fr_minmax(100px,auto)] gap-x-[5px]">
                        <th className="bg-white text-black mr-[15px] rounded-[10px] font-normal">휠 & 타이어</th>
                        <td className="text-left"><span className="w-[50px] mr-[20px]">| 기본 |</span>{optionWheel?.[0].topText}</td>
                        <td className="text-right">{optionWheel?.[0].price.toLocaleString()}원</td>
                      </tr>

                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </article>

        {/* 배송 정보 */}
        {/* <article className="border-t-[1px] border-[#a4a4a4] font-thin">
          <h3 className="text-[25px] font-bold mt-[27px]">배송정보</h3>
          <table className="mt-[27px] text-[20px]">
            <tbody>
              <tr className="grid grid-cols-[100px_auto] gap-x-[140px] mb-[15px]">
                <th className="text-right">인수방법</th>
                <td>매장배송</td>
              </tr>
              <tr className="grid grid-cols-[100px_auto] gap-x-[140px] mb-[15px]">
                <th className="text-right">배송지역</th>
                <td className="flex gap-x-[10px]">
                  <select name="" id="" className="text-black">
                    <option value="01">시/군/구 선택</option>
                    <option value="01">지역2</option>
                    <option value="01">지역3</option>
                  </select>
                  <select name="" id="" className="text-black">
                    <option value="01">동/읍/리 선택</option>
                    <option value="01">지역2</option>
                    <option value="01">지역3</option>
                  </select>
                </td>
              </tr>
              <tr className="grid grid-cols-[100px_auto] gap-x-[140px] mb-[15px]">
                <th className="text-right">출고센터</th>
                <td>노원구센터</td>
              </tr>
              <tr className="grid grid-cols-[100px_auto] gap-x-[140px] mb-[15px]">
                <th className="text-right">예상출고일</th>
                <td>즉시출고가능</td>
              </tr>
            </tbody>
          </table>
          <div className="flex gap-x-[10px] justify-end mt-[30px] text-[20px]">
              <span>옵션총합</span>
              <span>70,000원</span>
          </div>
        </article> */}

        {/* 등록비용 */}
        {/* <article className="border-t-[1px] border-[#a4a4a4]">
          <div className="flex justify-between items-center mt-[20px]">
            <h3 className="text-[25px] font-bold">등록비용</h3>
            <select name="" id="" className="text-black w-[80px] h-[50px]">
              <option value="">일반인</option>
              <option value="">모건</option>
              <option value="">수연</option>
            </select>

          </div>
          
          <table className="mt-[27px] text-[20px] w-full">
            <tbody>
              <tr className="flex justify-between gap-x-[140px] mb-[15px] ml-[20px]">
                <th className="text-right">취득세</th>
                <td className="flex gap-x-[10px]"><span>0</span>원</td>
              </tr>
              <tr className="flex justify-between gap-x-[140px] mb-[15px] ml-[20px]">
                <th className="text-right">공채</th>
                <td className="flex gap-x-[10px]"><span>0</span>원</td>
              </tr>
              <tr className="flex justify-between gap-x-[140px] mb-[15px] ml-[20px]">
                <th className="text-right">증지대</th>
                <td className="flex gap-x-[10px]"><span>0</span>원</td>
              </tr>
              <tr className="flex justify-between gap-x-[140px] mb-[15px] ml-[20px]">
                <th className="text-right">번호 (필름식기준)</th>
                <td className="flex gap-x-[10px]"><span>0</span>원</td>
              </tr>
              <tr className="flex justify-between gap-x-[140px] mb-[15px] ml-[20px]">
                <th className="text-right">등록대행 수수료</th>
                <td className="flex gap-x-[10px]"><span>0</span>원</td>
              </tr>
          
            </tbody>
          </table>
          <div className="flex gap-x-[10px] justify-end mt-[30px] text-[20px]">
              <span>등록비용 총합</span>
              <span>110,232원</span>
          </div>
        </article> */}


        {/* 총 결제금액 */}
        <article className="border-t-[1px] border-[#a4a4a4]">
          <div className="flex justify-between items-center mt-[20px]">
            <h3 className="text-[25px] font-bold">결제금액</h3>
            <div className="flex gap-x-[10px] items-center">
              <span className="text-right">총 차량 구매금액(a + b)</span>
              <div className="text-[30px]"><span>{price && price.toLocaleString()}</span>원</div>
            </div>
          </div>
          
          
          <div className="flex gap-x-[10px] justify-end mt-[30px] text-[20px]">
              <span>차량 구매 금액 (a)</span>
              <span>{price && price.toLocaleString()}원</span>
          </div>
          <div className="flex gap-x-[10px] justify-end text-[20px]">
              <span>임시 운행 의무보험료 (b)</span>
              <span>0원</span>
          </div>
        </article>
      </div>


      {/* 결제 요약 */}
      <div>
        <article className="w-[660px] py-[50px] bg-[#333] rounded-[5px]">
          <figure className="w-full pt-[250px] relative top-0 left-[50%] translate-x-[-50%]">
            {/* <Image src="/images/detail/defaultCar.png" fill alt="" className="absolute top-0 left-0"/> */}
            <Image src={imageMatch && SERVER + imageMatch.image} fill alt="선택한 자동차 이미지입니다" className="absolute top-0 left-0" style={{objectFit: "contain"}}/>
          </figure>
          <div className="px-[60px] flex flex-col items-center">
            <section className="border-b-[1px] border-[#a4a4a4] w-full py-[20px]">
              <h3 className="font-Hyundai-sans font-light text-[20px]">{title}</h3>
              <ul className="ml-[20px]">
                <li className="flex gap-x-[10px]">
                  <span>{optionExterior?.[0].name}</span><span>|</span>
                  <span>{optionInterior?.[0].items?.[0].name}</span>
                </li>
                <li>{optionEngine?.[0].topText} 외 <span>{tbodyLengthRef.current}</span>건</li>
              </ul>
            </section>

            <section className="border-b-[1px] border-[#a4a4a4] w-full py-[20px]">
              <div className="flex justify-between">
                <h3 className="font-Hyundai-sans font-light text-[20px]">총 차량 구매 금액</h3>
                <span>
                  <span className="text-[20px]">{price && price.toLocaleString()}</span>원
                </span>
              </div>
              <div className="ml-[20px] border-[1px] border-[#bbb]  mt-[12px] py-[20px]">
                <table className="w-[calc(100%-20px)]">
                  <tbody className="text-[15px] flex flex-col gap-y-[12px]">
                    <tr className="flex w-full">
                      <th className="font-light basis-1/4">차량 금액</th>
                      <td className="basis-3/4 text-right"><span>{price && price.toLocaleString()}</span>원</td>
                    </tr>
                    <tr className="flex w-full">
                      <th className="font-light basis-1/4">배송비</th>
                      <td className="basis-3/4 text-right"><span>금액미정</span></td>
                    </tr>
                    <tr className="flex w-full">
                      <th className="font-light basis-1/4">할인 금액</th>
                      <td className="basis-3/4 text-right"><span>-0</span>원</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="w-full py-[50px]">
  
              <div className="flex justify-between w-full">
                <h3 className="font-Hyundai-sans font-light text-[20px]">총 견적합계</h3>
                <span><span className="text-[30px]">{price && price.toLocaleString()}</span>원</span>
              </div>
              <div className="flex justify-between w-full">
                <h3 className="font-Hyundai-sans font-light text-[20px]">등록비용</h3>
                <span><span className="text-[20px]">75,000</span>원</span>
              </div>

            </section>

            <section className="text-[20px] grid grid-cols-[300px] grid-rows-[60px] gap-y-[15px]">
              {/* <button className="px-[20px]">커스텀 저장</button> */}
              <button className="px-[20px] w-full">뒤로가기</button>
              <button 
                className="bg-white text-black px-[20px] py-[15px] col-start-1 row-start-2 col-span-2" 
                onClick={(e) => payClick(e)}>결제하기
              </button>
            </section>
          </div>
          
        </article>
      </div>
    </div>
  </section>


  )
}