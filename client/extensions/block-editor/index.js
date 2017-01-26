/**
 * External dependencies
 */
import page from 'page';
import React from 'react';

/**
 * Internal dependencies
 */
import { renderPage } from 'lib/react-helpers';
import BlockEditor from './components/block-editor';

const render = ( context ) => {
	renderPage( context, <BlockEditor /> );
};

export default function() {
	page( '/blocks/:site?', render );
}
