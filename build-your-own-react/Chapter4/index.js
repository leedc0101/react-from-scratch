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
