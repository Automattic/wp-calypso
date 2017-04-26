/**
 * External dependencies
 */
import ReactDom from 'react-dom';
import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import Stylizer, { insertCss } from './stylizer';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';

export function concatTitle( ...parts ) {
	return parts.join( ' › ' );
}

export function renderPage( context, component ) {
	renderWithReduxStore(
		component,
		document.getElementById( 'primary' ),
		context.store
	);
}

export function recordPageView( path, ...title ) {
	analytics.pageView.record(
		path,
		concatTitle( ...title )
	);
}

export function renderWithReduxStore( reactElement, domContainer, reduxStore ) {
	const domContainerNode = ( 'string' === typeof domContainer )
			? document.getElementById( domContainer )
			: domContainer;

	return ReactDom.render(
		<ReduxProvider store={ reduxStore }>
			<Stylizer onInsertCss={ insertCss }>
				{ reactElement }
			</Stylizer>
		</ReduxProvider>,
		domContainerNode
	);
}
