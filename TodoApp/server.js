const express = require('express');
const app = express();
const bodyParser = require('body-parser'); // body-parser 설치 후에 추가
app.use(bodyParser.urlencoded({extended : true})); // body-parser 설치 후에 추가

app.listen(8080, function(){        //위 3줄 : 서버를 띄우기 위한 기본 셋팅(express 라이브러리)
  console.log('listening on 8080')  // listen(서버 띄울 포트번호, 띄운 후 실행할 코드)
}); 

// 누군가가 /pet 으로 방문하면 pet 관련된 안내문을 띄워주자
app.get('/pet', function(요청, 응답){
  응답.send('펫용품 쇼핑할 수 있는 페이지입니다.');
});

// 숙제. beauty
app.get('/beauty', function(요청, 응답){
  응답.send('뷰티용품 쇼핑할 수 있는 페이지입니다.');
});

// html 보내기
app.get('/', function(요청, 응답){ // /하나만 쓰면 홈
  응답.sendFile(__dirname + '/index.html');
});

// write.html 보여주기
app.get('/write', function(요청, 응답){
  응답.sendFile(__dirname + '/write.html');
});

// 어떤 사람이 /add 경로로 POST 요청을 하면 ~를 해주세요
app.post('/add', function(요청, 응답){
  응답.send('전송완료');
  console.log(요청.body);
}); // 전송한 정보는 요청에 저장됨