/**
 * External dependencies
 */
import React from 'react';
import ReactDom from 'react-dom';
import page from 'page';

/**
 * Internal dependencies
 */
import { find } from 'lodash';
import SITE_BLOCKS from './site-blocks';
import { renderPage } from 'lib/react-helpers';
import BusinessInfo from './business-info';
import Blocks from './blocks';
import ContentPreview from './content-preview';
import CustomizeBlock from './customize-block';
import { setSection } from 'state/ui/actions';

export function removeSidebar( context, next ) {
	context.store.dispatch( setSection( {
		group: 'pandance',
		secondary: false
	} ) );
	ReactDom.unmountComponentAtNode( document.getElementById( 'secondary' ) );
	next();
}

function wrap( component ) {
	return <div className="pandance">{ component }</div>;
}
// last handler don't call next()
export function businessInfo( context ) {
	renderPage( context, wrap( <BusinessInfo /> ));
}

// last handler don't call next()
export function index( context ) {
	renderPage( context, wrap( <Blocks /> ) );
}

// last handler don't call next()
export function contentPreview( context ) {
	renderPage( context, wrap( <ContentPreview /> ) );
}

export function customize( context ) {
	renderPage( context, wrap( <ContentPreview /> ) );
}

const getNextSelectedBlockId = ( blockId, selected ) =>
	find( selected, selectedBlockId => selectedBlockId > blockId
		&& find( SITE_BLOCKS, block => block.id === selectedBlockId ).editComponent );

export function customizeBlock( context ) {
	const requestedBlockId = +context.params.blockId || 0;

	const block = find( SITE_BLOCKS, siteBlock => siteBlock.id === requestedBlockId );
	const editComponent = block ? block.editComponent : null;

	const selectedBlocks = context.store.getState().pandance.selected;
	const nextBlockId = getNextSelectedBlockId( requestedBlockId, selectedBlocks );

	if ( editComponent ) {
		return renderPage( context, wrap(
			<CustomizeBlock editComponent={ editComponent } nextBlockId={ nextBlockId } component={block.component} />
		) );
	}

	page( '/pandance/customize/' +  nextBlockId );
}
