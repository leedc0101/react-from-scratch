/** @jsx MiniReact.createElement */
import MiniReact from './react.js';

let num = 0;

window.onload = function () {
  const root = document.getElementById('root');

  const rerender = (num) => {
    const element = MiniReact.createElement(
      'div',
      {
        className: 'foo',
      },
      MiniReact.createElement('div', null, 'Counter'),
      MiniReact.createElement('p', null, num),
      MiniReact.createElement(
        'div',
        null,
        MiniReact.createElement(
          'button',
          {
            onClick: () => rerender(num + 1),
          },
          '+'
        ),
        MiniReact.createElement(
          'button',
          {
            onClick: () => rerender(num - 1),
          },
          '-'
        )
      )
    );
    MiniReact.render(element, root);
  };

  rerender(num);
};
