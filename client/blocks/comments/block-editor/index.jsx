/**
 * External dependencies
 */
import React, { useEffect } from 'react';
import IsolatedBlockEditor from 'isolated-editor';

/**
 * WordPress dependencies
 */
import { addFilter } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import connectUserMentions from 'calypso/blocks/user-mentions/connect';

import getAddAutocompleters from './autocompleters';

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
	useEffect( () => {
		getAddAutocompleters( suggestions ).then( ( addAutoCompleters ) => {
			addFilter(
				'editor.Autocomplete.completers',
				'readerComments/autocompleters',
				addAutoCompleters
			);
		} );
	}, [ suggestions ] );
	return (
		<>
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
		</>
	);
};

export default connectUserMentions( BlockEditor );
