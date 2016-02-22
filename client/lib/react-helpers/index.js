/**
 * External dependencies
 */
import ReactDom from 'react-dom';
import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import config from 'config';

export default {
	renderWithReduxStore( reactElement, domContainer, reduxStore ) {
		const domContainerNode = ( 'string' === typeof domContainer )
				? document.getElementById( domContainer )
				: domContainer;

		if ( config( 'env' ) !== 'production' ) {
			// validate that what's passed has indeed the interface of redux store
			if ( typeof reduxStore.getState !== 'function'
				|| typeof reduxStore.dispatch !== 'function'
				|| typeof reduxStore.subscribe !== 'function' ) {
				throw new Error('Invalid redux store supplied!');
			}
		}

		return ReactDom.render(
			React.createElement( ReduxProvider, { store: reduxStore }, reactElement ),
			domContainerNode
		);
	}
};
