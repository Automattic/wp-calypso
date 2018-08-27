// import React from 'react';
// import { render } from 'react-dom';

console.warn("I am a block with raw DOM", document);

const h1 = document.createElement('h1');
const title = document.createTextNode('Hello World');
h1.appendChild( title )
document.body.appendChild( h1 );

// class App extends React.Component {
// 	render() {
// 		return <h1>Rendered</h1>;
// 	}
// }
// const div = document.createElement('div');
// document.body.appendChild(div);
// render(<App />, div);
