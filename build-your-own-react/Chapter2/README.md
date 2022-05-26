[DOM 관련 참고자료](https://ko.javascript.info/dom-navigation)

# `ReactDom.render`

우리가 만든 `React.createElement` 함수의 인자를 다시 살펴보자

```js
export const createElement = (type, props, ...children) => {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) => (typeof child === 'object' ? child : createTextElement(child))),
    },
  };
};
```

먼저 어떤 태그인지를 `type`으로 받고, 두 번째 인자로 `props`들을 받는다. <br>
또한 이외의 인자들을 children이라는 배열로 묶어서 전달받는다. <br>

이렇게 `createElement`로 만들어지는 `element`를 DOM에 그리는 함수가<br>
`ReactDom.render`인데 이를 구현해보자

먼저 우리가 render할 친구가 `text element`라면 `createTextNode`를 실행하고<br>
다른 일반적인 `element`라면 `createElement`을 실행해 `DOM` 노드를 만들어준다.

```js
const dom = element.type == 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(element.type);
```

이제 `element` 객체의 props property인 배열을 가져오고,<br>
children를 제외한 값들을 생성한 `DOM` 노드에 하나씩 넣어준다.

```js
Object.keys(element.props)
  .filter((key) => key !== 'children')
  .forEach((name) => {
    dom[name] = element.props[name];
  });
```

이제 `DOM`의 children들에게도 동일한 작업을 재귀적으로 실행해주면<br>
트리 아래 있는 친구들도 같은 로직으로 render를 실행하게 된다.

이렇게 완성된 DOM 노드를 부모 container에 붙이는 것으로 함수를 종료한다.

```js
element.props.children.forEach((child) => render(child, dom));
container.appendChild(dom);
```

재귀함수 호출 후 `appendChild` 함수를 실행하기에<br>
자식 노드들이 자신에게 `appendChild` 된 후에 자신도 부모에 `append` 한다.

```js
const root = document.getElementById('root');
MiniReact.render(element, root);
```

이렇게 완성된 `render` 함수를 우리가 그리고 싶은 `element`와<br>
`root` id 값을 갖고 있는 `element`를 넣어 실행해주면 된다.

# 완성본

```js
// react.js
export const render = (element, container) => {
  const dom = element.type == 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(element.type);

  Object.keys(element.props)
    .filter((key) => key !== 'children')
    .forEach((name) => {
      dom[name] = element.props[name];
    });

  // dom의 children마다 재귀적으로 render를 실행
  element.props.children.forEach((child) => render(child, dom));

  // 완성된 dom을 부모 container에 붙임
  container.appendChild(dom);
};

const MiniReact = {
  // snip...
  render,
};

export default MiniReact;
```

```js
// index.js
/** @jsx MiniReact.createElement */
import MiniReact from './react.js';

window.onload = function () {
  const element = MiniReact.createElement(
    'div',
    {
      className: 'bar',
    },
    MiniReact.createElement('h1', null, 'Chapter 1'),
    MiniReact.createElement('p', null, 'Hello ', MiniReact.createElement('b', null, 'World'))
  );
  const root = document.getElementById('root');
  MiniReact.render(element, root);
};
```
