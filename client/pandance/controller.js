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

export function removeSidebar( context, next ) {
	context.store.dispatch( setSection( {
		group: 'pandance',
		secondary: false
	} ) );
	ReactDom.unmountComponentAtNode( document.getElementById( 'secondary' ) );
	next();
}

// last handler don't call next()
export function index( context ) {
	renderPage( context, <BusinessInfo />);
}

// last handler don't call next()
export function blocks( context ) {
	renderPage( context, <Blocks /> );
}

// last handler don't call next()
export function contentPreview( context ) {
	renderPage( context, <ContentPreview /> );
}

export function customize( context ) {
	renderPage( context, <ContentPreview /> );
}

export function customizeBlock( context ) {
	renderPage( context, <ContentPreview blockId={ context.params.blockId } /> );
}
