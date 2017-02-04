/**
 * External dependencies
 */
import ReactDom from 'react-dom';
import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import Stylizer, { insertCss } from './stylizer';

export function concatTitle( ...parts ) {
	return parts.join( ' › ' );
}

export function renderPage( component, context, domContainer = 'primary' ) {
	return renderWithReduxStore(
		<Stylizer onInsertCss={ insertCss }>
			{ component }
		</Stylizer>,
		domContainer,
		context.store
	);
}

export function recordPageView( path, ...title ) {
	analytics.pageView.record(
		path,
		concatTitle( ...title )
	);
}

export function renderWithReduxStore( component, domContainer, reduxStore ) {
	const domContainerNode = ( 'string' === typeof domContainer )
		? document.getElementById( domContainer )
		: domContainer;

	return ReactDom.render(
		<ReduxProvider store={ reduxStore }>
			{ component }
		</ReduxProvider>,
		domContainerNode
	);
}
