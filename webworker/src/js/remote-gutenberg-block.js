// import React from 'react';
// import { render } from 'react-dom';

console.warn("I am a block with raw DOM", document);

// why is this in a setTimeout?
// because: https://github.com/ampproject/worker-dom/issues/10
function createExampleNode( titleText ) {
	const h1 = document.createElement('h1');
	const title = document.createTextNode(titleText);
	h1.appendChild( title )
	document.body.appendChild( h1 );
}
createExampleNode('hello world on worker boot');
setTimeout(() => {
	createExampleNode('hello world from setTimeout');
}, 100);
// class App extends React.Component {
// 	render() {
// 		return <h1>Rendered</h1>;
// 	}
// }
// const div = document.createElement('div');
// document.body.appendChild(div);
// render(<App />, div);
