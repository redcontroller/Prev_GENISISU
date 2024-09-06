'use client';

import Button from "@/components/Button";
import useLocalStorage from "@/hook/useLocalStorage";
import { Cart, ModelOption, OptionExterior } from "@/types/product";
import PortOne from "@portone/browser-sdk/v2";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";

interface PaymentsActionProps {
  vehicleInfo : {name:string, image:string}[],
  optionData : {[item: string]: ModelOption;}[],
  exteriorData : OptionExterior;
}

declare global {
  interface Window {
    daum: any;
  }
}

interface AddrType {
  address: string;
  zonecode: string;
  userSelectedType:string;
  roadAddress:string;
  bname:string;
  buildingName:string;
  apartment:string;
  jibunAddress:string;
  sigungu?:string;
  sido:string;
}

interface TaxOptions {
  tax04: number;
  tax06: number;
  insuranceTax: number;
  seoulNumcardCharge: number;
  regionNumcardCharge: number;
  defaultNumcard: string;
  shippingTaxGroupCapital: number;
  shippingTaxGroupJeju: number;
  shippingTaxGroupOther: number;
  regionTax: {
    [key: string]: number;
  };
}

export default function PaymentsAction (

  {vehicleInfo, optionData, exteriorData}: PaymentsActionProps) {

  const [storedValue, setValue] = useLocalStorage<Cart>('cart', {
    model:'',
    price:0,
  })




  // 선택안했을때 기본 옵션 저장 (각 옵션값의 첫번째)
  const optionExterior = exteriorData.extra.option.exterior[`${storedValue.model}`] // 외장 컬러
  const optionInterior = optionData[3].interior[`${storedValue.model}`] // 내장 컬러

  const optionEngine = optionData[0].engine[`${storedValue.model}`] // 엔진 타입
  const optionDrivetrain = optionData[1].drivetrain[`${storedValue.model}`] // 구동 타입
  const optionPassenger = optionData[2].passenger[`${storedValue.model}`] // 시트 구성
  const optionGarnish = optionData[4].garnish[`${storedValue.model}`] // 내장 가니쉬
  const optionWheel = optionData[5].wheel[`${storedValue.model}`] // 휠 & 타이어
  const optionAdd = optionData[6].add[`${storedValue.model}`]
// console.log("옵션데이터",optionAdd)

  const title = storedValue.model && storedValue.model?.split('-').join(' ').toUpperCase();
  const price = Number(storedValue.price);
  const SERVER : string = process.env.NEXT_PUBLIC_API_SERVER;
  const STOREID : string = process.env.NEXT_PUBLIC_API_SERVER;
  const CHANNELKEY : string = process.env.NEXT_PUBLIC_API_SERVER;
  const imageMatch = vehicleInfo.filter(item => item.name === storedValue.model)[0]

  const route = useRouter();
  const tbodyRef = useRef<HTMLTableSectionElement>(null)
  const texRef = useRef<HTMLTableSectionElement>(null)
  const tbodyLengthRef = useRef(0)
  const sumRef = useRef(null)

  const [selValue, setSelValue] = useState("normal");
  const [tax01Value, setTax01Value] = useState(1000000)
  const [tax02Value, setTax02Value] = useState(0)
  const [tax03Value, setTax03Value] = useState(0)
  const [isAble, setIsAble] = useState(false)
  const [detailAddr, setDetailAddr] = useState("")
  const [numCardTax, setNumCardTax] = useState(0)
  // const [sigungu,setSigungu] = useState("")
  const [sidoTax,setSidoTax] = useState("")
  const [optionPrice, setOptionPrice] = useState([])

  // 전체 옵션갯수 반영 및 초기 랜더링
  useEffect(()=>{
    if (tbodyRef.current) {
      tbodyLengthRef.current = tbodyRef.current.querySelectorAll('tr').length -1;
      
      const optionPriceEl = tbodyRef.current.querySelectorAll('.optionsPrice')
      const optionPriceArr = Array.from(optionPriceEl).map((item)=>parseFloat(item.textContent.replace(/[^0-9.-]/g, ''))).reduce((acc, price) => acc + price, 0)
      setOptionPrice(optionPriceArr)
    }
  },[])

  // 세금 반영
  const taxOptions : TaxOptions = {
    tax04:3000,
    tax06:50000,
    insuranceTax:1900,
    seoulNumcardCharge:18000,
    regionNumcardCharge:15700,
    defaultNumcard:"주소를 먼저 검색해주세요",
    shippingTaxGroupCapital:385000,
    shippingTaxGroupJeju:530000,
    shippingTaxGroupOther:277000,
    regionTax:{
      "서울": 353000,
      "인천": 389000,
      "경기": 415000,
      "강원특별자치도": 393000,
      "세종특별자치시": 300000,
      "충남": 319000,
      "대전": 278000,
      "충북": 351000,
      "대구": 176000,
      "경북": 176000,
      "부산": 275000,
      "경남": 336000,
      "울산": 262000,
      "전북특별자치도": 380000,
      "전남": 409000,
      "광주": 326000,
      "제주특별자치도": 530000
    }
  }

  // 장애여부 세금 부과
  useEffect(()=>{
    if (texRef.current) {
      switch (selValue) {
        case "normal":
          setTax01Value(1000000)
          setTax02Value(price * 0.07)
          setTax03Value(price * 0.025)
          setIsAble(false)
          break;
        case "disabled":
          setTax01Value(0)
          setTax02Value(0)
          setTax03Value(0)
          setIsAble(true)
          break;
        default:
          setTax01Value(1000000)
          setTax02Value(price * 0.07)
          setTax03Value(price * 0.025)
          setIsAble(false)
          break;
      }
    }
  },[selValue])
  const handleValueChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelValue(e.currentTarget.value)
  }

  let taxSum = - tax01Value + tax02Value + tax03Value + taxOptions.tax04 + numCardTax + taxOptions.tax06




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
      totalAmount: Number(`${price && (price + taxOptions.insuranceTax)}`),
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

  // 우편주소 다음 api
  const handleClickSearchAddr = () => {
    new window.daum.Postcode({
      oncomplete: function(data : AddrType) {
          // 팝업에서 검색결과 항목을 클릭했을때 실행할 코드를 작성하는 부분입니다.
          // 예제를 참고하여 다양한 활용법을 확인해 보세요.

          let addr = ''; // 주소 변수
          let extraAddr = ''; // 참고항목 변수

          if (data.userSelectedType === 'R') { // 사용자가 도로명 주소를 선택했을 경우
            addr = data.roadAddress;
            if(data.bname !== '' && /[동|로|가]$/g.test(data.bname)){
              extraAddr += data.bname;
              }
            // 건물명이 있고, 공동주택일 경우 추가한다.
            if(data.buildingName !== '' && data.apartment === 'Y'){
                extraAddr += (extraAddr !== '' ? ', ' + data.buildingName : data.buildingName);
              }
            // 표시할 참고항목이 있을 경우, 괄호까지 추가한 최종 문자열을 만든다.
            if(extraAddr !== ''){
                extraAddr = ' (' + extraAddr + ')';
              }
            // 조합된 참고항목을 해당 필드에 넣는다.
            const postExtraAddr = document.getElementById("postExtraAddr") as HTMLInputElement;
            if (postExtraAddr) {
                postExtraAddr.value = extraAddr;
              }
          } else { // 사용자가 지번 주소를 선택했을 경우(J)
            addr = data.jibunAddress;
          }
          
          const postCode = document.getElementById("postCode") as HTMLInputElement;
          if (postCode) {
            postCode.value = data.zonecode;
          }

          // 중요포인트. 주소에 따라 배송비 결정부분
          const postAddr = document.getElementById("postAddr") as HTMLInputElement;
          if (postAddr) {
            // postAddr.value = addr;
            setDetailAddr(addr)
          }

          const postDetailAddr = document.getElementById("postDetailAddr") as HTMLInputElement;
          if (postDetailAddr) {
            postDetailAddr.focus();
          }

          // sido (시/도) 구분에 따라 taxOption의 regionTax 값 일치 비교하여 배송비 결정
          setSidoTax(prev => prev = taxOptions.regionTax[data.sido])


      }
    }).open();
  }

  // 지역 구분에 따른 세금 부과
  useEffect(()=>{
    if (detailAddr.split(" ")[0] === "서울") {
      setNumCardTax(taxOptions.seoulNumcardCharge)
    } else if (detailAddr === "") {
      setNumCardTax(0)
    }else {
      setNumCardTax(taxOptions.regionNumcardCharge)
    }
  },[detailAddr])

  // 옵션 선택값 컴포넌트 구분
  const OptionView = ({ type, option } : {type:string, option:OptionItem[]}) => {
    
    if (storedValue.option?.[type] === undefined || storedValue.option?.[type].name === option[0].topText ) {
      return(
        <>
          <td className="text-left">{type === "add" ? "-" : option?.[0].topText}</td>
          <td className="text-right">
            <span className="w-[50px] mr-[10px]">{type === "add" ? "" : "(기본)"}</span>
            <span className="optionsPrice">
              {type === "add" ? 0 : option?.[0].price.toLocaleString()}
            </span>원
          </td>
        </>
      ) 
    } else if (storedValue.option?.[type] !== undefined){
      return(
        <>
          <td className="text-left">{type === "add" || type === "garnish" ? storedValue.option?.[type].name?.split("-")[1] : storedValue.option?.[type].name}</td>
          <td className="text-right">
            <span className="optionsPrice">
              {storedValue.option?.[type].price.toLocaleString()}
            </span>원
          </td>
        </>
      )
    }
  }

  return(
    <>   
      <Script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js" async/>
      <section>
        <div className="ml-[300px] pt-[150px] grid grid-cols-2 gap-x-[80px]">
          {/* 옵션 선택 정보 */}
          <div className="flex flex-col gap-y-[20px]">
            <article className="flex items-end gap-x-[8px]">
              <h2 className="text-[40px] mb-[-3px]">김모건</h2><h3 className="text-[30px]">님께서 선택하신 옵션</h3>
            </article>

            {/* 차량 정보 */}
            <article className="border-t-[1px] border-[#a4a4a4]">
              <h3 className="text-[25px] font-bold mt-[27px]">차량정보</h3>
              <table className="w-full mt-[27px] text-[15px]">
                <tbody>
                  <tr className="grid grid-cols-[80px_auto_auto] gap-x-[60px] mb-[15px]">
                    <th className="text-right">모델명</th>
                    <td className="text-gray-400">{title}</td>
                    <td className="text-right text-gray-400">{price.toLocaleString() + "원"}</td>
                  </tr>
                  
                  <tr className="grid grid-cols-[80px_auto] gap-x-[60px] mb-[15px]">
                    <th className="text-right">색상</th>
                    <td>
                      <table className="w-full text-gray-400">
                        <tbody className="flex flex-col gap-y-[10px] h-full">
                          <tr className="grid grid-cols-[90px_4fr_minmax(100px,auto)] gap-x-[5px] text-nowrap">
                            <th className="mr-[15px] rounded-[10px] font-normal text-left">외장 컬러</th>
                            <td className="flex gap-x-[10px]">
                              <figure className="w-[25px] h-[25px] relative border-[1px] border-[#fff]">
                                <Image src={optionExterior && SERVER + optionExterior?.[0].items[0].images?.[0].path} fill 
                                style={{objectFit:"cover"}} alt="" className="absolute top-0 left-0"
                                ></Image>
                              </figure>
                              <span>{optionExterior?.[0].items[0].name}</span>
                            </td>
                            <td className="text-right"><span className="w-[50px] mr-[10px]">(기본)</span>{optionExterior && optionExterior?.[0].items[0].price?.toLocaleString()}원</td>
                          </tr>

                          <tr className="grid grid-cols-[90px_4fr_minmax(100px,auto)] gap-x-[5px] text-nowrap">
                            <th className="mr-[15px] rounded-[10px] font-normal text-left">내장 컬러</th>
                            <td className="flex gap-x-[10px]">
                              <figure className="w-[25px] h-[25px] bg-white relative border-[1px] border-[#fff]">
                                <Image src={optionInterior && SERVER + optionInterior?.[0].items?.[0].images?.[0].path} fill 
                                  style={{objectFit:"cover"}} alt="" className="absolute top-0 left-0"
                                  ></Image>
                              </figure>
                              <span>{optionInterior?.[0].items?.[0].name}</span>
                            </td>
                            <td className="text-right"><span className="w-[50px] mr-[10px]">(기본)</span>{optionInterior?.[0].items?.[0].price?.toLocaleString()}원</td>
                          </tr>
      
                        </tbody>
                      </table>
                    </td>
                  </tr>
      

                  <tr className="grid grid-cols-[80px_auto] gap-x-[60px] mb-[15px]">
                    <th className="text-right">옵션</th>
                    <td>
                      <table className="w-full text-gray-400">
                        <tbody className="flex flex-col gap-y-[10px]" ref={tbodyRef}>
                          <tr className="grid grid-cols-[90px_4fr_minmax(100px,auto)] gap-x-[5px]">
                            <th className="text-left mr-[15px] rounded-[10px] font-normal">엔진 타입</th>
                              <OptionView type="engine" option={optionEngine}/>
                          </tr>
                          <tr className="grid grid-cols-[90px_4fr_minmax(100px,auto)] gap-x-[5px]">
                            <th className="text-left mr-[15px] rounded-[10px] font-normal">구동 타입</th>
                              <OptionView type="drivetrain" option={optionDrivetrain}/>
                          </tr>
                          <tr className="grid grid-cols-[90px_4fr_minmax(100px,auto)] gap-x-[5px]">
                            <th className="text-left mr-[15px] rounded-[10px] font-normal">시트 구성</th>
                                <OptionView type="passenger" option={optionPassenger}/>
                          </tr>
                          <tr className="grid grid-cols-[90px_4fr_minmax(100px,auto)] gap-x-[5px]">
                            <th className="text-left mr-[15px] rounded-[10px] font-normal">내장 가니쉬</th>
                                <OptionView type="garnish" option={optionGarnish}/>
                          </tr>
                          <tr className="grid grid-cols-[90px_4fr_minmax(100px,auto)] gap-x-[5px]">
                            <th className="text-left mr-[15px] rounded-[10px] font-normal">휠 & 타이어</th>
                                <OptionView type="wheel" option={optionWheel}/>
                          </tr>
                          <tr className="grid grid-cols-[90px_4fr_minmax(100px,auto)] gap-x-[5px]">
                            <th className="text-left mr-[15px] rounded-[10px] font-normal">선택 옵션</th>
                                <OptionView type="add" option={optionAdd}/>
                          </tr>

                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="flex gap-x-[10px] justify-end mt-[30px] text-[20px] font-bold">
                  <span>옵션총합 (a)</span>
                  <span>{(price + optionPrice).toLocaleString()}원</span>
              </div>
            </article>

            {/* 배송 정보 */}
            <article className="border-t-[1px] border-[#a4a4a4] font-thin">
              <h3 className="text-[25px] font-bold mt-[27px]">배송정보</h3>
              <table className="mt-[27px] w-full">
                <tbody>
                  <tr className="grid grid-cols-[100px_auto] gap-x-[140px] mb-[15px]">
                    <th className="text-right">인수방법</th>
                    <td className="text-gray-400 font-normal">자택배송</td>
                  </tr>
                  <tr className="grid grid-cols-[100px_auto] gap-x-[140px] mb-[15px]">
                    <th className="text-right">배송지역</th>
                    <td className="w-full">
                      <div className="grid grid-cols-2 gap-[10px] auto-rows-[40px] text-white font-normal">
                        <input type="text" id="postCode" placeholder="우편번호" className="bg-transparent border-b-[1px] border-gray-400"/>
                        <Button onClick={handleClickSearchAddr} className="w-[150px] bg-white hover:bg-transparent text-black hover:text-white transition-all justify-self-end">우편번호 찾기</Button>
                        <input type="text" id="postAddr" placeholder="주소" className="col-span-2 bg-transparent border-b-[1px] border-gray-400" value={detailAddr}/>
                        <input type="text" id="postDetailAddr" placeholder="상세주소" className="bg-transparent border-b-[1px] border-gray-400"/>
                        <input type="text" id="postExtraAddr" placeholder="참고 항목" className="bg-transparent border-b-[1px] border-gray-400"/>
                      </div>


                      {/* <select name="" id="" className="text-black">
                        <option value="01">시/군/구 선택</option>
                        <option value="01">지역2</option>
                        <option value="01">지역3</option>
                      </select>
                      <select name="" id="" className="text-black">
                        <option value="01">동/읍/리 선택</option>
                        <option value="01">지역2</option>
                        <option value="01">지역3</option>
                      </select> */}


                    </td>
                  </tr>
                  {/* <tr className="grid grid-cols-[100px_auto] gap-x-[140px] mb-[15px]">
                    <th className="text-right">출고센터</th>
                      <td className="text-gray-400 font-normal">
                        {sigungu === "" ? "(지역을 선택해주세요)" : sigungu + "센터"}
                      </td>
                  </tr> */}
                  <tr className="grid grid-cols-[100px_auto] gap-x-[140px] mb-[15px]">
                    <th className="text-right">예상출고일</th>
                    <td className="text-gray-400 font-normal">즉시출고가능</td>
                  </tr>
                </tbody>
              </table>
              <div className="flex gap-x-[10px] justify-end mt-[30px] text-[20px] font-bold">
                <span>배송비 (b)</span>
                <span>
                  {sidoTax === "" ? "- 원" : (sidoTax.toLocaleString()) + "원"}
                </span>
              </div>
            </article>

            {/* 등록비용 */}
            <article className="border-t-[1px] border-[#a4a4a4]">
              <div className="flex justify-between items-center mt-[20px]">
                <h3 className="text-[25px] font-bold">등록비용</h3>
                <select name="" id="" className="text-black w-[120px] h-[50px]" onChange={handleValueChange} defaultValue="normal" >
                  <option value="normal">일반인</option>
                  <option value="disabled" >장애인</option>
                </select>

              </div>
              
              <table className="mt-[27px] w-full">
                <tbody ref={texRef}>
                  <tr className="flex justify-between gap-x-[140px] mb-[15px] ml-[20px]">
                    <th className="text-right">면세</th>
                    <td className="flex gap-x-[10px] text-gray-400">
                      <span>
                        {isAble 
                        ? <span className="mr-[10px] text-gray-400">(면제)</span>
                        : "- "
                        }
                        {tax01Value.toLocaleString() + "원"}
                      </span>
                    </td>
                  </tr>
                  <tr className="flex justify-between gap-x-[140px] mb-[15px] ml-[20px]">
                    <th className="text-right">취득세</th>
                    <td className="flex gap-x-[10px] text-gray-400">
                      <span>
                        {isAble 
                        ? <span className="mr-[10px] text-gray-400">(면제)</span>
                        : ""
                        }
                        {tax02Value.toLocaleString() + "원"}
                      </span>
                    </td>
                  </tr>
                  <tr className="flex justify-between gap-x-[140px] mb-[15px] ml-[20px]">
                    <th className="text-right">공채</th>
                    <td className="flex gap-x-[10px] text-gray-400">
                      <span>
                        {isAble 
                        ? <span className="mr-[10px] text-gray-400">(면제)</span>
                        : ""
                        }
                        {tax03Value.toLocaleString() + "원"}
                      </span>
                    </td>
                  </tr>
                  <tr className="flex justify-between gap-x-[140px] mb-[15px] ml-[20px]">
                    <th className="text-right">증지대</th>
                    <td className="flex gap-x-[10px] text-gray-400"><span>{taxOptions.tax04.toLocaleString() + "원"}</span></td>
                  </tr>
                  <tr className="flex justify-between gap-x-[140px] mb-[15px] ml-[20px]">
                    <th className="text-right">번호 (필름식기준)</th>
                    <td className="flex gap-x-[10px] text-gray-400">
                      <span>{numCardTax === 0 ? "(배송지 미지정)" : numCardTax.toLocaleString() + "원"}</span>
                    </td>
                  </tr>
                  <tr className="flex justify-between gap-x-[140px] mb-[15px] ml-[20px]">
                    <th className="text-right">등록대행 수수료</th>
                    <td className="flex gap-x-[10px] text-gray-400"><span>{taxOptions.tax06.toLocaleString() + "원"}</span></td>
                  </tr>
              
                </tbody>
              </table>
              <div className="flex gap-x-[10px] justify-end mt-[30px] text-[20px] font-bold">
                  <span>등록비용 총합 (c)</span>
                  <span>{taxSum.toLocaleString() + "원"}</span>
              </div>
            </article>

            {/* 임시 운행 의무보험료 */}
            <article className="border-t-[1px] border-[#a4a4a4]">
              <div className="flex justify-between items-center mt-[20px]">
                <h3 className="text-[25px] font-bold">임시 운행 의무보험료 (d)</h3>
                <div className="flex gap-x-[10px] items-center">
                  <div className="text-[30px]">{taxOptions.insuranceTax.toLocaleString()}원</div>
                </div>
              </div>
            </article>

            {/* 총 결제금액 */}
            <article className="border-t-[1px] border-[#a4a4a4]">
              
              <div className="w-full flex justify-between mt-[30px]">
                <h3 className="text-[25px] font-bold text-nowrap">결제금액</h3>
                <div className="text-gray-400 w-full flex flex-col gap-y-[10px]">
                  <div className="grid grid-cols-[3fr_1fr] justify-end">
                      <span className="text-right">옵션 총합 (a)</span>
                      <span className="text-right">{(price + optionPrice).toLocaleString()}원</span>
                  </div>
                  <div className="grid grid-cols-[3fr_1fr] justify-end">
                      <span className="text-right">배송비 (b)</span>
                      <span className="text-right">{sidoTax === "" ? "(배송비 미지정)" : (sidoTax.toLocaleString()) + "원"}</span>
                  </div>
                  <div className="grid grid-cols-[3fr_1fr] justify-end">
                      <span className="text-right">등록비용 총합 (c)</span>
                      <span className="text-right">{taxSum.toLocaleString()}원</span>
                  </div>
                  <div className="grid grid-cols-[3fr_1fr] justify-end">
                      <span className="text-right">임시 운행 의무보험료 (b)</span>
                      <span className="text-right">{taxOptions.insuranceTax.toLocaleString()}원</span>
                  </div>
                </div>
               
              </div>         

              <div className="flex gap-x-[10px] justify-end items-center mt-[20px] mb-[30px]">
                <span className="text-[20px] text-right">총 차량 구매금액 <span className="text-gray-400">(a + b + c + d)</span></span>
                <div className="text-[30px]">
                  <span>{((price + optionPrice) + (sidoTax ? sidoTax : 0) + taxSum + taxOptions.insuranceTax).toLocaleString()}</span>원
                </div>
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
                      <span>{optionExterior?.[0].items[0].name}</span><span>|</span>
                      <span>{optionInterior?.[0].items?.[0].name}</span>
                    </li>
                    <li>{optionEngine?.[0].topText} 외 <span>{tbodyLengthRef.current}</span>건</li>
                  </ul>
                </section>

                <section className="border-b-[1px] border-[#a4a4a4] w-full py-[20px]">
                  <div className="flex justify-between">
                    <h3 className="font-Hyundai-sans font-light text-[20px]">총 차량 구매 금액 내역</h3>
                    {/* <span>
                      <span className="text-[20px]">{price && price.toLocaleString()}</span>원
                    </span> */}
                  </div>
                  <div className="ml-[20px] border-[1px] border-[#bbb]  mt-[12px] py-[20px]">
                    <table className="w-[calc(100%-20px)]">
                      <tbody className="text-[15px] flex flex-col gap-y-[12px]">
                        <tr className="flex w-full">
                          <th className="font-light basis-1/4">차량 금액</th>
                          <td className="basis-3/4 text-right"><span>{price && price.toLocaleString()}</span>원</td>
                        </tr>
                        <tr className="flex w-full">
                          <th className="font-light basis-1/4">옵션 금액</th>
                          <td className="basis-3/4 text-right"><span>{optionPrice && optionPrice.toLocaleString()}</span>원</td>
                        </tr>
                        <tr className="flex w-full">
                          <th className="font-light basis-1/4">배송비</th>
                          <td className="basis-3/4 text-right"><span>{sidoTax === "" ? "(배송지 미지정)" : (sidoTax.toLocaleString()) + "원"}</span></td>
                        </tr>
                        <tr className="flex w-full">
                          <th className="font-light basis-1/4">등록 비용</th>
                          <td className="basis-3/4 text-right"><span>{taxSum.toLocaleString()}</span>원</td>
                        </tr>
                        <tr className="flex w-full items-center">
                          <th className="font-light basis-1/4">임시 운행<br/> 의무보험료</th>
                          <td className="basis-3/4 text-right "><span>{taxOptions.insuranceTax.toLocaleString()}</span>원</td>
                        </tr>
                        {/* <tr className="flex w-full">
                          <th className="font-light basis-1/4">할인 금액</th>
                          <td className="basis-3/4 text-right"><span>-0</span>원</td>
                        </tr> */}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="w-full py-[30px]">
      
                  <div className="flex justify-between w-full">
                    <h3 className="font-Hyundai-sans font-light text-[20px]">총 견적합계</h3>
                    <span><span className="text-[30px]">{((price + optionPrice) + (sidoTax ? sidoTax : 0) + taxSum + taxOptions.insuranceTax).toLocaleString()}</span>원</span>
                  </div>
                  {/* <div className="flex justify-between w-full">
                    <h3 className="font-Hyundai-sans font-light text-[20px]">등록비용 (별도납부)</h3>
                    <span><span className="text-[20px]">{taxSum.toLocaleString()}</span>원</span>
                  </div> */}

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
    </>

  )
}