function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) => (typeof child === 'object' ? child : createTextElement(child))),
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

function createDom(fiber) {
  // dom 생성
  const dom = fiber.type == 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(fiber.type);

  // 생성한 dom에 children을 제외한 property를 부여
  Object.keys(fiber.props)
    .filter((key) => key !== 'children')
    .forEach((name) => {
      dom[name] = fiber.props[name];
    });

  return dom;
}

function commitRoot() {
  // 한번에 완성되어 있는 wipRoot에서부터 commitWork 시작하고
  commitWork(wipRoot.child);
  // 다 끝나면 wipRoot를 완료했다는 의미로 null로 재할당해준다.
  wipRoot = null;
}

function commitWork(fiber) {
  // 만약 wipRoot에 아무것도 없으면 return
  if (!fiber) return;

  // 그게 아니라면 재귀함수로 fiber끼리 이어준다.
  const domParent = fiber.parent.dom;
  domParent.appendChild(fiber.dom);
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function render(element, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
  };
  nextUnitOfWork = wipRoot;
}

let nextUnitOfWork = null;
let wipRoot = null;

function workLoop(deadline) {
  let shouldYield = false;

  while (nextUnitOfWork && !shouldYield) {
    // 더 이상 performUnitOfWork에서 appendChild 하지 않는다
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }

  // 더 이상 할일이 없고, 아직 작업 안한 wipRoot 살아있으면 commitRoot 실행
  if (!nextUnitOfWork && wipRoot) commitRoot();

  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

function performUnitOfWork(fiber) {
  // fiber의 dom을 만든다
  if (!fiber.dom) fiber.dom = createDom(fiber);

  const elements = fiber.props.children;
  let index = 0;
  let prevSibling = null;

  // fiber의 자식을 하나씩 탐색한다
  while (index < elements.length) {
    const element = elements[index];

    const newFiber = {
      type: element.type,
      props: element.props,
      parent: fiber,
      dom: null,
    };

    // 만약 index가 0이라면 자식, 아니라면 자식의 형제로 설정
    if (index === 0) fiber.child = newFiber;
    else prevSibling.sibling = newFiber;

    // 이전 sibling을 prevSibling에 저장하면서 사슬마냥 sibling끼리 이을 수 있게 됨
    prevSibling = newFiber;
    index++;
  }

  // 위에는 피버 트리를 세팅하는 작업이고
  // 여기서부터 unitOfWork가 할당된다고 보면 됨
  // 만약 fiber의 child가 있다면 그것을 리턴하고 nextUnitOfWork에 할당
  if (fiber.child) return fiber.child;

  let nextFiber = fiber;
  // children이 없다면 sibling을 return, 그것도 없다면 부모로 계속 올라가며 sibling 탐색하고 return
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }
}

const MiniReact = {
  createElement,
  render,
};

export default MiniReact;
