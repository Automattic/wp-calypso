/**
 * External dependencies
 */

import ReactDom from 'react-dom';
import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';

/**
 * Internal dependencies
 */
import MomentProvider from 'calypso/components/localized-moment/provider';

export function concatTitle( ...parts ) {
	return parts.join( ' › ' );
}

export function renderWithReduxStore( reactElement, domContainer, reduxStore ) {
	const domContainerNode =
		'string' === typeof domContainer ? document.getElementById( domContainer ) : domContainer;

	return ReactDom.render(
		<ReduxProvider store={ reduxStore }>
			<MomentProvider>{ reactElement }</MomentProvider>
		</ReduxProvider>,
		domContainerNode
	);
}
