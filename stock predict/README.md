# Stock Predict AI

기술적 지표 앙상블로 주가 방향·목표가를 추정하는 교육용 데모입니다.

## 실행

프로젝트 루트에서 정적 서버를 띄운 뒤 브라우저에서 엽니다.

```bash
npx serve .
# → http://localhost:3000/stock%20predict/
```

또는 짧은 경로 `/stock-predict` (vercel redirect).

## 구성

| 파일 | 역할 |
|------|------|
| `index.html` | UI |
| `styles.css` | 레이아웃·시각 |
| `js/data.js` | Yahoo Finance 시세 (실패 시 데모 시리즈) |
| `js/predict.js` | SMA/EMA/RSI/모멘텀/회귀 앙상블 |
| `js/chart.js` | 캔버스 차트 |
| `js/app.js` | 화면 연결 |

## 참고

투자 자문이 아닙니다. 실시세는 CORS 프록시를 경유하며, 차단되면 DEMO 데이터로 동작합니다.
