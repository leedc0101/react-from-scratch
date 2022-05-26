## Problem with render()

이전에 구현한 `render` 함수에 문제가 있다. <br>
바로 재귀호출 때문에, `root` div에서 한번 렌더링을 시작하면, <br>
중간에 멈추지 않는다는 것이다.

즉 브라우저가 중간에 다른 일을 하고 싶어도, 하위 컴포넌트까지 전부 그리고 나서야<br>
그 일을 진행할 수 있다는 것이다.<br>
이런 blocking은 결국 유저의 input이나 애니메이션과 같은 동작을 부드럽지 못하게 만든다.

이 때문에 우리는 렌더링 작업을 작은 unit으로 나누고<br>
하나의 unit이 끝나면 브라우저가 잠깐 다른 작업을 할 수 있게끔 해줄 것이다.

## requestIdleCallback

[관련 Mozilla](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback)

requestIdleCallback는 setTimeout과 비슷한 느낌이다.<br>
받은 callback 함수를 갖고 있다가, 브라우저의 main thread가 동작 가능할 때 이를 실행시킨다.

사실 React는 더 이상 이 함수를 쓰지 않고, [sceduler package](https://github.com/facebook/react/tree/main/packages/scheduler)를 쓰지만<br>
기능 상의 큰 차이는 없으니, 이를 이용하도록 하자

```js
export const workLoop = (deadline) => {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }
  requestIdleCallback(workLoop);
};

requestIdleCallback(workLoop);
```
