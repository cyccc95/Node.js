let router = require('express').Router(); // npm으로 설치했던 express 라이브러리의 Router()라는 함수를 쓰겠다

// 분리해서 쓰고 싶은 route 가져와서 app 대신 router 쓰기

// 누군가가 /pet 으로 방문하면 pet 관련된 안내문을 띄워주자
router.get('/pet', function(요청, 응답){
  응답.send('펫용품 쇼핑할 수 있는 페이지입니다.');
});

// 숙제. beauty
router.get('/beauty', function(요청, 응답){
  응답.send('뷰티용품 쇼핑할 수 있는 페이지입니다.');
});

module.exports = router;