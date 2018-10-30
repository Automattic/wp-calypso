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

/**
 * Internal dependencies
 */
import Layout from './components/layout';
import './store';

if ( isEnabled( 'gutenberg/block/jetpack-preset' ) ) {
	require( 'gutenberg/extensions/presets/jetpack/editor.js' );
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
		<EditorProvider settings={ editorSettings } post={ { ...post, ...overridePost } } { ...props }>
			<ErrorBoundary onError={ onError }>
				<Layout />
			</ErrorBoundary>
		</EditorProvider>
	);
}


export default withSelect( ( select ) => ( {
	hasFixedToolbar: select( 'core/edit-post' ).isFeatureActive( 'fixedToolbar' ),
} ) )( Editor );
