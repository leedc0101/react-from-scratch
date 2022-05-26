## Fiber

다만 생각해봐야 하는 것이, 과연 어떻게 이 unit을 나눌 것인가 이다. <br>
이 때 등장하는 개념이 바로 `fiber tree`이다.

다음은 Fiber 트리의 예제이다.

##### ![](https://velog.velcdn.com/images/leedc0101/post/b7aed908-f947-427a-aae8-2aa6d6772461/image.png)

여기서 우리는 `root fiber`를 `nextUnitOfWork`로 설정하고 `performUnitOfWork`를 실행한다. <br>
`performUnitOfWork` 함수는 다음과 같은 세가지 작업을 하는데

1. element를 Dom에 추가하고
2. 그 element의 자식들의 `fiber`를 생성한다.
3. 마지막으로 다음 unit of work를 선택한다.

이 때 3번에서, 다음 unit of work를 선택하는 방법을 설정해야 하는데, <br>
통상적으로 children으로 설정하게 된다. <br>
다만, children이 없다면 `sibling` element를, <br>
만약 `sibling`도 없다면 `uncle` element를 `fiber`로 만들고 다음 unit of work로 설정한다. <br>
마지막으로 `uncle`도 없다면, `sibling` 이나 `unlce`을 찾을 때까지 부모 element로 올라가고 <br>
그렇게 `root`에 도달하면 `render`를 종료한다.

예를 들어서, 위의 그림에서 `<p>`에 대해 `performUnitOfWork` 를 실행하면 <br>
형제 element인 `<a>`를 다음 unit of work로 설정하고, <br>
`<a>`에 대해 `performUnitOfWork`를 실행하면, <br>
삼촌 element인 `<h2>`를 다음 unit of work로 설정한다.

마지막으로 `<h2>`는 형제나 삼촌 element가 없으므로 부모인 `div`로 올라가고 <br>
`div`도 마찬가지인 상황이므로 결국 부모인 `root`에 도달하게 되므로 `render`가 완료된다.

```js
// workLoop은 후에 내용을 더 추가할 예정
export const workLoop = (deadline) => {
  let shouldYield = false;
  while (nextUintOfWork && !shouldYield) {
    nextUintOfWork = performUnitOfWork(nextUintOfWork);
  }
};

export const performUnitOfWork = (fiber) => {
  // fiber의 dom을 만든다
  if (!fiber.dom) fiber.dom = createDom(fiber)
​
  // fiber의 부모에 이를 붙인다.
  if (fiber.parent) fiber.parent.dom.appendChild(fiber.dom)

  const elements = fiber.props.children
  let index = 0
  let prevSibling = null

  // fiber의 자식을 하나씩 탐색한다.  ​
  while (index < elements.length) {
    const element = elements[index]
​
    // 자식 element로 fiber를 새로 만들고
    const newFiber = {
      type: element.type,
      props: element.props,
      parent: fiber,
      dom: null,
    }

    // 만약 index가 0이면 자식으로, 아니라면 자식의 형제로 설정
    if (index === 0) {
      fiber.child = newFiber
    } else {
      prevSibling.sibling = newFiber
    }
  ​
    // 나중에 sibling이 생겼을 때 지금 만든 element의 sibling으로 설정해주기 위해서 prevSibling에 저장해둠
    prevSibling = newFiber
    index++

    // 만약 fiber의 child가 있다면 그것을 리턴하고 newUnitOfWork에 할당
    if (fiber.child) return fiber.child

    // 만약 child이 없다면, sibling을 return하거나, 그것도 없으면 부모를 계속 탐색하면서 sibling을 찾음
    let nextFiber = fiber
    while (nextFiber) {
      if (nextFiber.sibling) {
        return nextFiber.sibling
      }
      nextFiber = nextFiber.parent
    }
  }
}
```
