[다음 링크를 참고하여 작성하였습니다](https://pomb.us/build-your-own-react/)

# 들어가기 전에

앞으로의 React From Scratch를 진행하기 위해서는 <br>
React, JSX, DOM element의 동작방식을 알아야한다.

<br>

## DOM이란 무엇일까?

[Mozilla 공식문서](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction)

> The Document Object Model (DOM) is a programming interface for web documents.

직역하면 문서 객체 모델로, HTML과 XML문서의 프로그래밍 interface이다.<br>
문서를 구조화된 표현으로 번역하여, 프로그래밍 언어가 쉽게 접근할 수 있도록 도와준다.<br>
DOM은 `node`와 `object`로 문서를 표현한다.

사실 이 DOM은 브라우저가 만들어준다. <br>
때문에 만드는 브라우저 마음이라, 표준으로 이를 통일함<br>
근데 그렇다해도 통상 표준 이외에 다른 기능들도 제공하기에, <br>
이런 부분에 대해서는 브라우저마다 다를 수 있다는 것을 인지해야 함

사실 우리는 자바스크립트를 써서 DOM을 수정한다고 흔히들 알고 있지만,<br>
굳이 Javascript가 아니더라도, Python과 같은 여타 언어로도 DOM을 수정 가능하다.

접근하는 방법은 간단하다.<br>
브라우저에서 자신만의 방법으로 DOM을 구현해주며<br>
`window`와 `document` 전역 객체의 API를 이용하여 DOM을 조작할 수 있음

```js
window.onload = function () {
  console.log(document);
  console.log(document.documentElement);
  console.log(document.body);
  console.log(document.getElementById('root'));
};
```

<br>

## React -> Vanilla JS

```js
const element = <h1 title="foo">Hello</h1>;
const container = document.getElementById('root');
ReactDOM.render(element, container);
```

CRA 프로젝트의 `index.js` 같은 곳에서 볼 수 있는 간단한 코드이다.<br>
보다시피 JSX와 ReactDOM과 같은 React의 API를 사용하고 있다.<br>
이를 Vanilla JS로 바꿔보자

먼저 JSX는 Babel과 같은 빌드 툴에 의해서 JS로 변환된다.<br>
일단 이런 것까지 지금 구현할 수는 없으므로, 변환된 결과 값만 적어보자

```js
const element = {
  type: 'h1',
  props: {
    title: 'foo',
    children: 'Hello',
  },
};
```

이제 이 `element` 객체를 가지고 `node`를 만들어주면 된다.

```js
const node = document.createElement(element.type);
node['title'] = element.props.title;

const text = document.createTextNode('');
text['nodeValue'] = element.props.children;
```

[nodeValue - Mozilla Docs](https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeValue)

이제 text를 node에 child로 넣어주고<br>
node를 root에 child로 넣어주면 끝이다.

```js
const container = document.getElementById('root');
node.appendChild(text);
container.appendChild(node);
```

이걸 트리로 돌면서 넣어주는 방식으로 처리하는 걸 구현하지 않을까 싶다.
