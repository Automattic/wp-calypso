/**
 * External dependencies
 */
import React, { useEffect, useState } from 'react';
import IsolatedBlockEditor from 'isolated-block-editor';

/**
 * WordPress dependencies
 */
import { addFilter } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import connectUserMentions from 'calypso/blocks/user-mentions/connect';
import getAddAutocompleters from './autocompleters';

import './style.scss';

const allowedBlocks = [
	'core/paragraph',
	'core/heading',
	'core/list',
	'core/code',
	'core/table',
	'core/quote',
	'core/separator',
];

const BlockEditor = ( { onChange, suggestions } ) => {
	const [ isLoaded, setIsLoaded ] = useState( false );

	useEffect( () => {
		// ensure that the addAutoCompleters filter is added before the IsolatedBlockEditor is loaded
		// so that the filters are definitely run
		new Promise( ( resolve ) => {
			getAddAutocompleters( suggestions ).then( ( addAutoCompleters ) => {
				addFilter(
					'editor.Autocomplete.completers',
					'readerComments/autocompleters',
					addAutoCompleters
				);
				resolve();
			} );
		} ).then( () => setIsLoaded( true ) );
	}, [ suggestions ] );

	if ( ! isLoaded ) {
		return null;
	}

	return (
		<IsolatedBlockEditor
			onSaveContent={ ( html ) => onChange( html ) }
			// eslint-disable-next-line no-console
			onError={ console.error }
			settings={ {
				iso: {
					moreMenu: false,
					blocks: {
						allowBlocks: allowedBlocks,
					},
				},
			} }
		/>
	);
};

export default connectUserMentions( BlockEditor );
