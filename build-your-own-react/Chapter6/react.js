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
  console.log('hi');
  // dom 생성
  const dom = fiber.type == 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(fiber.type);

  // 생성한 dom에 children을 제외한 property를 부여
  updateDom(dom, {}, fiber.props);

  return dom;
}

// event들은 다르게 처리해줘야 됨
const isEvent = (key) => key.startsWith('on');
const isProperty = (key) => key !== 'children' && !isEvent(key);
const isNew = (prev, next) => (key) => prev[key] !== next[key];
const isGone = (prev, next) => (key) => !(key in next);

function updateDom(dom, prevProps, nextProps) {
  console.log('hi');
  Object.keys(prevProps)
    .filter(isEvent)
    .filter((key) => !(key in nextProps) || isNew(prevProps, nextProps)(key))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.removeEventListener(eventType, prevProps[name]);
    });

  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach((name) => {
      dom[name] = '';
    });

  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      dom[name] = nextProps[name];
    });

  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      console.log('hi');
      dom.addEventListener(eventType, nextProps[name]);
    });
}

function commitRoot() {
  deletions.forEach(commitWork);

  // 한번에 완성되어 있는 wipRoot에서부터 commitWork 시작하고
  commitWork(wipRoot.child);
  currentRoot = wipRoot;
  // 다 끝나면 wipRoot를 완료했다는 의미로 null로 재할당해준다.
  wipRoot = null;
}

function commitWork(fiber) {
  // 만약 wipRoot에 아무것도 없으면 return
  if (!fiber) return;

  // 그게 아니라면 재귀함수로 fiber끼리 이어준다.
  const domParent = fiber.parent.dom;

  if (fiber.effectTag === 'PLACEMENT' && fiber.dom != null) domParent.appendChild(fiber.dom);
  else if (fiber.effectTag === 'UPDATE' && fiber.dom != null) updateDom(fiber.dom, fiber.alternate.props, fiber.props);
  else if (fiber.effectTag === 'DELETION') domParent.removeChild(fiber.dom);
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function render(element, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot,
  };
  deletions = [];
  nextUnitOfWork = wipRoot;
}

let nextUnitOfWork = null;
// work in progress root
let wipRoot = null;
// last committed root
let currentRoot = null;
let deletions = null;

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
  reconcileChildren(fiber, elements);

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

// 새로 들어온 element로 wipFiber를 재조정하는 함수
function reconcileChildren(wipFiber, elements) {
  let index = 0;
  // alternate와 그의 자식이 있는지 없는지 확인하고 alternate의 child 할당, 만약 없으면 null이 들어가겠지
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
  let prevSibling = null;

  while (index < elements.length || oldFiber != null) {
    const element = elements[index];
    let newFiber = null;

    // 지금부터 차이 비교
    const sameType = oldFiber && element && element.type == oldFiber.type;

    // 같은 타입이면 props만 업데이트
    if (sameType) {
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        // 나중에 commit에서 사용
        effectTag: 'UPDATE',
      };
    }

    // 다른 타입이면 교체
    if (element && !sameType) {
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: 'PLACEMENT',
      };
    }

    // oldFiber만 있으면
    if (oldFiber && !sameType) {
      oldFiber.effectTag = 'DELETION';
      deletions.push(oldFiber);
    }

    // 이제 다음 탐색을 위해 oldFiber를 형제로 바꾼다
    if (oldFiber) oldFiber = oldFiber.sibling;

    // 만약 index가 0이라면 자식, 아니라면 자식의 형제로 설정
    if (index === 0) wipFiber.child = newFiber;
    else prevSibling.sibling = newFiber;

    // 이전 sibling을 prevSibling에 저장하면서 사슬마냥 sibling끼리 이을 수 있게 됨
    prevSibling = newFiber;
    index++;
  }
}

const MiniReact = {
  createElement,
  render,
};

export default MiniReact;
