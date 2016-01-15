import React from 'react';
import Hello from './components/hello';

export default function helloController() {
	React.render(
		<Hello />,
		document.getElementById( 'primary' )
	);
}
