# wipRoot

```js
export const performUnitOfWork = (fiber) => {
  // snippet..

  // fiber의 부모에 이를 붙인다.
  if (fiber.parent) fiber.parent.dom.appendChild(fiber.dom);

  // snippet..
};
```

위의 코드에서 문제가 있다. <br>
바로 fiber의 부모에 이를 붙이게 되면,<br>
유저 입장에서는 다 완성되지 않은 홈페이지를 보게 된다.

따라서 이를 방지하기 위해, 홈페이지가 다 완성되었을 때 이를 보여주도록 해보자

일단 위의 `performUnitOfWork`에서 해당 `appendChild` 하는 라인을 지워주고,<br>
workLoop을 다음과 같이 바꿔준다.

```js
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

// ...

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
```

> #### 여기서 궁금했던 점...
>
> 재귀함수가 싱글 스레드를 blocking해서 `unit of work`를 만들어<br>
> 빈틈이 날 떄마다 처리해줬던 것 같은데, 결국은 이 방식대로라면 똑같은 blocking 아닌가?
>
> 아무래도 fiber, dom끼리 append 하는 작업은 오래 걸리지 않아서 괜찮은건가?
