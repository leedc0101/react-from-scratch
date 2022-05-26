export default function App(props) {
  const [num, setNum] = MiniReact.useState(0);
  const [name, setName] = MiniReact.useState(props.default);

  return MiniReact.createElement(
    'div',
    null,
    MiniReact.createElement('h1', null, 'Hi, ', name),
    MiniReact.createElement('input', {
      placeholder: 'Your name',
      oninput: (e) => setName(e.target.value),
    }),
    MiniReact.createElement(
      'div',
      null,
      MiniReact.createElement('p', null, num),
      MiniReact.createElement(
        'button',
        {
          onClick: () => setNum(num + 1),
        },
        '+'
      ),
      MiniReact.createElement(
        'button',
        {
          onClick: () => setNum(num - 1),
        },
        '-'
      )
    )
  );
}
