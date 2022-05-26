/** @jsx MiniReact.createElement */

window.onload = function () {
  const element = (
    <div className="foo">
      <div>something</div>
      <p>
        Hello <b>World</b>
      </p>
    </div>
  );
  console.log(element);
};
