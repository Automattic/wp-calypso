/**
 * External dependencies
 */
import React from 'react';
import ReactDom from 'react-dom';

/**
 * Internal dependencies
 */
import HelloWorldPrimary from 'themes/hello-world/main-secondary';
import HelloWorldSecondary from 'themes/hello-world/main-secondary';

const Controller = {
	helloWorld() {
		ReactDom.render(
			<HelloWorldPrimary />,
			document.getElementById( 'primary' ) // Element to render to
		);
		ReactDom.render(
			<HelloWorldSecondary />,
			document.getElementById( 'secondary' ) // Element to render to
		);
	}
};

export default Controller;
