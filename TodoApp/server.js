const express = require('express');
const app = express();

const bodyParser = require('body-parser'); // body-parser 설치 후에 추가
app.use(bodyParser.urlencoded({extended : true})); // body-parser 설치 후에 추가

const MongoClient = require('mongodb').MongoClient; // mongodb 라이브러리 설치 후 작성

app.set('view engine', 'ejs'); // ejs  쓰겠다고 등록해줘야 함

let db; // 변수 하나 필요
MongoClient.connect('mongodb+srv://cyccc95:`1q2w3e4r@cluster0.jx7nlat.mongodb.net/?retryWrites=true&w=majority', function(에러, client){

  if(에러) return console.log(에러)
  db = client.db('todoapp'); // todoapp 이라는 database(폴더)에 연결

  // db.collection('post').insertOne({이름 : 'John', 나이 : 25, _id : 100}, function(에러, 결과){
  //   console.log('저장완료');
  // }); // post라는 collection에 데이터 저장

  app.listen(8080, function(){        //위 3줄 : 서버를 띄우기 위한 기본 셋팅(express 라이브러리)
    console.log('listening on 8080')  // listen(서버 띄울 포트번호, 띄운 후 실행할 코드)
  }); 

  
}) // mongodb 클라우드 접속


// app.listen(8080, function(){        //위 3줄 : 서버를 띄우기 위한 기본 셋팅(express 라이브러리)
//   console.log('listening on 8080')  // listen(서버 띄울 포트번호, 띄운 후 실행할 코드)
// }); 

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
// app.post('/add', function(요청, 응답){
//   응답.send('전송완료');
//   console.log(요청.body);
// }); // 전송한 정보는 요청에 저장됨

// 어떤 사람이 /add라는 경로로 post 요청을 하면, 데이터 2개(날짜, 제목)를 보내주는데,
// 이 때, 'post'라는 이름을 가진 collection에 두개 데이터를 저장하기
app.post('/add', function(요청, 응답){
  응답.send('전송완료');
  db.collection('post').insertOne({ 제목 : 요청.body.title, 날짜 : 요청.body.date }, function(에러, 결과){
    console.log('저장완료');
  });
});

// 누가 /list로 접속하면 실제 DB에 저장된 데이터들로 예쁘게 꾸며진 html을 보여줌
app.get('/list', function(요청, 응답){
  // db에 저장된 post라는 collection 안의 모든 데이터를 꺼내주세요
  db.collection('post').find().toArray(function(에러, 결과){
    console.log(결과);
    응답.render('list.ejs', { posts : 결과 }); //결과라는 데이터가 posts라는 이름으로 ejs 안으로 넣어줌
  });

});
