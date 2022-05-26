export const createElement = (type, props, ...children) => {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) => (typeof child === 'object' ? child : createTextElement(child))),
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

export const render = (element, container) => {
  // dom 생성
  const dom = element.type == 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(element.type);

  // 생성한 dom에 children을 제외한 property를 부여
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
  createElement,
  render,
};

export default MiniReact;
