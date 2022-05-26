# Summary

1. `yarn`
2. `npx babel --plugins @babel/plugin-transform-react-jsx index.js --out-file index_transformed.js`

<br>

# `createElement` Function

```js
// (1)
const element = <h1 title="foo">Hello</h1>;

// (2)
const element = React.createElement('h1', { title: 'foo' }, 'Hello');

// (3)
const element = {
  type: 'h1',
  props: {
    title: 'foo',
    children: 'Hello',
  },
};
```

(1)에서 (2)를 만드는 건 babel과 같은 빌드 툴의 역할이고, <br>
우리는 (2)에서 (3)을 만드는 `createElement` 함수를 만들어보자

만드는 법은 간단하다. <br>
그냥 첫 번째, 두 번째 인자로 type, props를 받고,<br>
나머지는 `...children`으로 묶어서 이를 객체로 반환해주면 된다

```js
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children,
    },
  };
}
```

다만 children이 `string`이나 `number`와 같은 원시 객체인 경우에는<br>
텍스트라는 뜻이므로 textElement로 바꿔주어야 한다.

따라서 위에서 만든 createElement에, 각 children이 object인지 검사를 하고<br>
만약 아니라면 createTextElement라는 다른 함수로 처리해주도록 하자.

```js
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) => {
        typeof child === 'object' ? child : createTextElement(child);
      }),
    },
  };
}

function createTextElement(text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: [],
    },
  };
}
```

여기까지 했으면, 이제 (1) -> (2)를 해볼 차례다.<br>
하지만 아까도 말했다시피, React 조차도 이를 직접적으로 구현하지 않고<br>
babel이라는 빌드 툴의 도움을 받는다.

이를 위해 node 환경에서 이를 트랜스파일링 해보도록 하자

먼저 `yarn add --dev @babel/core @babel/cli @babel/plugin-transform-react-jsx`로<br>
babel pulgin을 설치해주고
`npx babel --plugins @babel/plugin-transform-react-jsx index.js --out-file index_transformed.js`으로<br>
transform할 파일 이름을 넣어 CLI로 실행시켜주면 된다.

근데 지금 상태로 돌리면 React.createElement로 변환되기 때문에<br>
우리가 만든 함수로 하기 위해서는 어노테이션을 붙여줘야한다.

난 내가 만들 React 패키지를 MiniReact라고 하기로 했다.

```js
// utils/react.js
export const createElement = (type, props, ...children) => {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) =>
        typeof child === 'object'
          ? child
          : createTextElement(child))),
    },
  };
};

export const createTextElement = (text) => {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: [],
    },
  };
};

export const MiniReact = {
  createElement,
  createTextElement,
};
```

따라서 MiniReact.createElement를 붙여서 Transform하려면 <br>
`/** @jsx MiniReact.createElement */` 를 붙여주면 된다.

```js
// index.js
/** @jsx MiniReact.createElement */
import MiniReact from './react.js';

window.onload = function () {
  const element = (
    <div className="foo">
      <div>something</div>
      <p>
        Hello <b>World</b>
      </p>
    </div>
  );
};
```

이 상태에서<br>
`npx babel --plugins @babel/plugin-transform-react-jsx index.js --out-file index_transformed.js`<br>
를 실행하면 다음과 같이 변환된다.

> 위의 명령어를 나눠보면, 일단 babel를 global로 설치하는건 권장하지 않아 npx를 사용했고,<br>
> @babel/plugin-transform-react-jsx 플러그인을 이용해<br>
> index.js를 컴파일하고, `--out-file index.js`은 그 결과를 index_transformed.js로 만들어라 라는 뜻이다<br>
> 덮어씌울려면 그냥 `--out-file index.js`로 하면 된다.

```js
// index_transformed.js
/** @jsx MiniReact.createElement */
import MiniReact from './react.js';

window.onload = function () {
  const element = MiniReact.createElement(
    'div',
    {
      className: 'foo',
    },
    MiniReact.createElement('div', null, 'something'),
    MiniReact.createElement('p', null, 'Hello ', MiniReact.createElement('b', null, 'World'))
  );
  console.log(element);
};
```

사실 줄바꿈 이런게 제대로 적용되서 나오진 않았지만, 이정도면 나쁘지 않은 것 같다.

이제 이 element를 render하는 함수를 직접 짜볼 시간이다.
