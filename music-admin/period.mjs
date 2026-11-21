// 순서: 한국 날짜 → 한 달·일 년 만료일 → 날짜 유효성·마감 시각.
export function musicToday(now=Date.now()){return new Date(now+9*3600000).toISOString().slice(0,10);}
export function musicPeriodEnd(months,now=Date.now()){
 if(![1,12].includes(months))return '';
 const [year,month,day]=musicToday(now).split('-').map(Number),first=new Date(Date.UTC(year,month-1+months,1)),last=new Date(Date.UTC(first.getUTCFullYear(),first.getUTCMonth()+1,0)).getUTCDate();
 return [first.getUTCFullYear(),String(first.getUTCMonth()+1).padStart(2,'0'),String(Math.min(day,last)).padStart(2,'0')].join('-');
}
export function musicExpiryAt(value){
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return null;
 const start=Date.parse(value+'T00:00:00+09:00'),end=Date.parse(value+'T23:59:59.999+09:00');
 return Number.isFinite(start)&&musicToday(start)===value?end:null;
}
