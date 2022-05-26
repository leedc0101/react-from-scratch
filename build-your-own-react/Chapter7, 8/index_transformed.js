/** @jsx MiniReact.createElement */
import MiniReact from './react.js';

window.onload = function () {
  const root = document.getElementById('root');

  function App(props) {
    const [num, setNum] = MiniReact.useState(0);
    const [name, setName] = MiniReact.useState(props.default);
    return MiniReact.createElement("div", null, MiniReact.createElement("h1", null, props.name), MiniReact.createElement("input", {
      oninput: e => setName(e.target.value),
      placeholder: "yournmae"
    }));
  }

  const element = MiniReact.createElement(App, {
    default: 'please type your name'
  });
  MiniReact.render(element, root);
};
