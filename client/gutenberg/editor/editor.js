/** @format */
/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress dependencies
 */
import { EditorProvider, ErrorBoundary } from '@wordpress/editor';
import { StrictMode } from '@wordpress/element';

/**
 * Internal dependencies
 */
import Layout from './components/layout';

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
			<EditorProvider
				settings={ editorSettings }
				post={ { ...post, ...overridePost } }
				{ ...props }
			>
				<ErrorBoundary onError={ onError }>
					<Layout />
				</ErrorBoundary>
			</EditorProvider>
		</StrictMode>
	);
}

export default Editor;
