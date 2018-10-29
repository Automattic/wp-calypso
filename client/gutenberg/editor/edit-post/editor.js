/**
 * External dependencies
 */
import React from 'react';
import { isEnabled } from 'config';

/**
 * WordPress dependencies
 */
import { withSelect } from '@wordpress/data';
import { EditorProvider, ErrorBoundary } from '@wordpress/editor';
import { StrictMode } from '@wordpress/element';

/**
 * Internal dependencies
 */
import Layout from './components/layout';
import './store';

import 'gutenberg/extensions/presets/jetpack/editor.js';

if ( isEnabled('gutenberg/block/simple-payments') ) {
	require( 'gutenberg/extensions/simple-payments/editor.js' );
}

function Editor( { settings, hasFixedToolbar, post, overridePost, onError, ...props } ) {
	if ( ! post ) {
		return null;
	}

	const editorSettings = {
		...settings,
		hasFixedToolbar,
	};

	return (
		<StrictMode>
			<EditorProvider settings={ editorSettings } post={ { ...post, ...overridePost } } { ...props }>
				<ErrorBoundary onError={ onError }>
					<Layout />
				</ErrorBoundary>
			</EditorProvider>
		</StrictMode>
	);
}


export default withSelect( ( select ) => ( {
	hasFixedToolbar: select( 'core/edit-post' ).isFeatureActive( 'fixedToolbar' ),
} ) )( Editor );
