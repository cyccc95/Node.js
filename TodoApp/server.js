const express = require('express');
const app = express();

const bodyParser = require('body-parser'); // body-parser 설치 후에 추가
app.use(bodyParser.urlencoded({extended : true})); // body-parser 설치 후에 추가

const MongoClient = require('mongodb').MongoClient; // mongodb 라이브러리 설치 후 작성

app.set('view engine', 'ejs'); // ejs  쓰겠다고 등록해줘야 함

app.use('/public', express.static('public')); // public 폴더를 쓸거다

const methodOverride = require('method-override');
app.use(methodOverride('_method')); // method-override 사용

const passport = require('passport'); // passport 라이브러리 첨부
const LocalStrategy = require('passport-local').Strategy; // passport-local 라이브러리 첨부
const session = require('express-session'); // express-session 라이브러리 첨부
app.use(session({secret : '비밀코드', resave : true, saveUninitialized : false}));
app.use(passport.initialize());
app.use(passport.session()); // app.use(미들웨어) : 요청-응답 중간에 뭔가 실행되는 코드

require('dotenv').config(); // .env 쓰기 위한 라이브러리

let db; // 변수 하나 필요
MongoClient.connect(process.env.DB_URL, function(에러, client){

  if(에러) return console.log(에러)
  db = client.db('todoapp'); // todoapp 이라는 database(폴더)에 연결

  // db.collection('post').insertOne({이름 : 'John', 나이 : 25, _id : 100}, function(에러, 결과){
  //   console.log('저장완료');
  // }); // post라는 collection에 데이터 저장

  app.listen(process.env.PORT, function(){        //위 3줄 : 서버를 띄우기 위한 기본 셋팅(express 라이브러리)
    console.log('listening on 8080')  // listen(서버 띄울 포트번호, 띄운 후 실행할 코드)
  }); 

  
}); // mongodb 클라우드 접속


// app.listen(8080, function(){        //위 3줄 : 서버를 띄우기 위한 기본 셋팅(express 라이브러리)
//   console.log('listening on 8080')  // listen(서버 띄울 포트번호, 띄운 후 실행할 코드)
// }); 

// /pet, /beauty router 첨부
app.use('/', require('./routes/shop.js')); // '/'으로 접속하면 shop.js를 routing 하겠다

// html 보내기
app.get('/', function(요청, 응답){ // /하나만 쓰면 홈
  응답.render('index.ejs');
});

// write.html 보여주기
app.get('/write', function(요청, 응답){
  응답.render('write.ejs');
});





// 누가 /list로 접속하면 실제 DB에 저장된 데이터들로 예쁘게 꾸며진 html을 보여줌
app.get('/list', function(요청, 응답){
  // db에 저장된 post라는 collection 안의 모든 데이터를 꺼내주세요
  db.collection('post').find().toArray(function(에러, 결과){
    console.log(결과);
    응답.render('list.ejs', { posts : 결과 }); //결과라는 데이터가 posts라는 이름으로 ejs 안으로 넣어줌
  });

});


// 상세페이지 (parameter로 요청가능한 url 백개 만들기)
app.get('/detail/:id', function(요청, 응답){
  db.collection('post').findOne({_id : parseInt(요청.params.id)}, function(에러, 결과){
    console.log(결과);
    응답.render('detail.ejs', { data : 결과 });
  });
  
});

// edit 페이지
app.get('/edit/:id', function(요청, 응답){
  db.collection('post').findOne({_id : parseInt(요청.params.id)}, function(에러, 결과){
    응답.render('edit.ejs', { post : 결과 });
  });
  
});

// edit 경로로 put 요청
app.put('/edit', function(요청, 응답){
  db.collection('post').updateOne({ _id : parseInt(요청.body.id) } , { $set : { 제목 : 요청.body.title, 날짜 : 요청.body.date }}, function(에러, 결과){
    console.log('수정완료');
    응답.redirect('/list'); // 수정하고 list 페이지로 이동
  });
});

// 로그인 페이지 제작 & 라우팅
// 회원가입 기능은 아직 안만들어서 db에서 아이디/비번 한쌍을 만들자
app.get('/login', function(요청, 응답){
  응답.render('login.ejs')
});
app.post('/login', passport.authenticate('local', {
    failureRedirect : '/fail' // 실패하면 /fail 로 이동해주세요
  }), function(요청, 응답){ //passport : 로그인 기능 쉽게 구현해줌
    응답.redirect('/') // 성공하면 home으로 이동해주세요
});

// 아이디 비번 인증하는 세부 코드 작성 , 인증하는 방법을 strategy라고 칭함
passport.use(new LocalStrategy({
  usernameField : 'id', // 사용자가 제출한 아이디가 어디 적혔는지
  passwordField : 'pw', // 사용자가 제출한 비번이 어디 적혔는지
  session : true, // 세션을 만들건지
  passReqToCallback : false, // 아이디/비번 말고 다른 정보검사가 필요한지
}, function(입력한아이디, 입력한비번, done){ // 아이디/비번 검증해줌
  // console.log(입력한아이디, 입력한비번);
  db.collection('login').findOne({id : 입력한아이디}, function(에러, 결과){
    if(에러) return done(에러)
    if(!결과) return done(null, false, {message : '존재하지않는 아이디요'}) //DB에 아이디가 없을때
    if(입력한비번 == 결과.pw){
      return done(null, 결과)
    } else {
      return done(null, false, {message : '비번 틀렸어요'}) // done(서버에러, 성공시사용자db데이터, 에러메세지)
    }
  });
}));

// 세션만들기
// id를 이용해서 세션을 저장시키는 코드
passport.serializeUser(function(user, done){ // 아이디/비번 검증 성공시 user에 결과가 들어감
  done(null, user.id)
});
// 이 세션 데이터를 가진 사람을 DB에서 찾아주세요(마이페이지 접속시 발동)
passport.deserializeUser(function(아이디, done){
  // db에서 위에 있는 user.id로 유저를 찾은 뒤에 유저 정보를 밑에 {}안에 넣음
  db.collection('login').findOne({id : 아이디}, function(에러, 결과){
    done(null, 결과)
  })
}); //  찾은 정보는 mypage에 접속할때 요청.user에 담김 - app.get('/mypage') 에서 확인

// 회원가입
app.post('/register', function(요청, 응답){
  db.collection('login').insertOne( { id : 요청.body.id, pw : 요청.body.pw }, function(에러, 결과){
    응답.redirect('/')
  } ) // insertOne : db에 저장
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
  // 총게시물갯수 꺼내오기
  db.collection('counter').findOne({name : '게시물갯수'}, function(에러, 결과){
    console.log(결과.totalPost);
    let 총게시물갯수 = 결과.totalPost;

    let 저장할거 = { _id : 총게시물갯수 + 1, 제목 : 요청.body.title, 날짜 : 요청.body.date, 작성자 : 요청.user._id };

    db.collection('post').insertOne(저장할거, function(에러, 결과){
      console.log('저장완료');
      // totalPost 라는 항목도 1 증가시켜야함 (수정)
      db.collection('counter').updateOne({name : '게시물갯수'},{$inc : {totalPost:1}},function(에러, 결과){
        if(에러){return console.log(에러)}
      });
    });
  
  });
});


// delete 기능
app.delete('/delete', function(요청, 응답){
  console.log(요청.body);
  // 요청.body를 숫자로 변환
  요청.body._id = parseInt(요청.body._id);

  let 삭제할데이터 = { _id : 요청.body._id, 작성자 : 요청.user._id };

  // 요청.body에 담겨온 게시물번호를 가진 글을 db에서 찾아서 삭제해주세요
  db.collection('post').deleteOne(삭제할데이터, function(에러, 결과){
    console.log('삭제완료');
    if(에러) {console.log(에러)};
    응답.status(200).send({ message : '성공했습니다' }); // 요청 성공하면 응답코드 200을 보내주세요 400은 고객 잘못 실패, 500은 서버 문제 실패
  })
});

// 로그인한 사람만 들어갈수있는 마이페이지
app.get('/mypage', 로그인했니, function(요청, 응답){
  console.log(요청.user)
  응답.render('mypage.ejs', {사용자 : 요청.user}) // mypage.ejs에 파일에 데이터를 보내줌
});
function 로그인했니(요청, 응답, next){ // 미들웨어
  if(요청.user){ // 로그인 후 세션이 있으면 요청.user가 항상있음
    next()
  } else {
    응답.send('로그인안하셨는데요?')
  }
};

// server에서 query string 꺼내는 법
app.get('/search', function(요청, 응답){
  let 검색조건 =  [
    {
      $search: {
        index: 'titleSearch',
        text: {
          query: 요청.query.value,
          path: '제목' //제목날짜 둘다 찾고 싶으면 ['제목', '날짜']
        }
      }
    },
    { $sort : { _id : 1} }, // 찾고 결과를 id 순서로 정렬
    { $limit : 10}, // 위에서 10개만 가져와주세요
    { $project : { 제목 : 1, _id: 0, score: { $meta: "searchScore" } } } // 검색 결과에 필터주기 1은 가져오고 0은 안가져옴, score 달라고 하면 줌
  ];
  console.log(요청.query.value);  // search index에서 검색
  db.collection('post').aggregate(검색조건).toArray((에러, 결과) => {
    console.log(결과)
    응답.render('search.ejs', {posts : 결과})
  })
});

