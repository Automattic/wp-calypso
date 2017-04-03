/**
 * External dependencies
 */
import React from 'react';
import ReactDom from 'react-dom';

/**
 * Internal dependencies
 */
import { renderPage } from 'lib/react-helpers';
import BusinessInfo from './business-info';
import Blocks from './blocks';
import ContentPreview from './content-preview';
import { setSection } from 'state/ui/actions';

function removeSidebar( context ) {
	context.store.dispatch( setSection( {
		group: 'pandance',
		secondary: false
	} ) );
	ReactDom.unmountComponentAtNode( document.getElementById( 'secondary' ) );
}

// last handler don't call next()
export function index( context ) {
	removeSidebar( context );
	renderPage( context, <BusinessInfo />);
}

// last handler don't call next()
export function blocks( context ) {
	removeSidebar( context );
	renderPage( context, <Blocks /> );
}

// last handler don't call next()
export function contentPreview( context ) {
	removeSidebar( context );
	renderPage( context, <ContentPreview /> );
}
