/** @format */

/**
 * External dependencies
 */

import ReactDom from 'react-dom';
import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';

export function concatTitle( ...parts ) {
	return parts.join( ' › ' );
}

export function renderWithReduxStore( reactElement, domContainer, reduxStore ) {
	const domContainerNode =
		'string' === typeof domContainer ? document.getElementById( domContainer ) : domContainer;

	return ReactDom.render(
		React.createElement( ReduxProvider, { store: reduxStore }, reactElement ),
		domContainerNode
	);
}
