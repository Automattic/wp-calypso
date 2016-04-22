/**
 * External dependencies
 */
import ReactDom from 'react-dom';
import React from 'react';

/**
 * Internal dependencies
 */
import { setSection } from 'state/ui/actions';

export function show404( context ) {
	ReactDom.unmountComponentAtNode( document.getElementById( 'secondary' ) );
	context.store.dispatch( setSection( null, { hasSidebar: false } ) );

	const Page404 = require( 'layout/404' );

	ReactDom.render(
		<Page404 />,
		document.getElementById( 'primary' )
	);
}
