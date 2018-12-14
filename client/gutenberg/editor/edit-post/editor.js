/** @format */
/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress dependencies
 */
import { withSelect } from '@wordpress/data';
import { EditorProvider, ErrorBoundary, PostLockedModal } from '@wordpress/editor';

/**
 * Internal dependencies
 */
import Layout from './components/layout';
// GUTENLYPSO START
import './hooks';
import './store';
// GUTENLYPSO END

function Editor( {
	settings,
	hasFixedToolbar,
	focusMode,
	post,
	overridePost, // GUTENLYPSO
	initialEdits,
	onError,
	...props
} ) {
	if ( ! post ) {
		return null;
	}

	const editorSettings = {
		...settings,
		hasFixedToolbar,
		focusMode,
	};

	return (
		<EditorProvider
			settings={ editorSettings }
			post={ { ...post, ...overridePost } } // GUTENLYPSO
			initialEdits={ initialEdits }
			{ ...props }
		>
			<ErrorBoundary onError={ onError }>
				<Layout />
			</ErrorBoundary>
			<PostLockedModal />
		</EditorProvider>
	);
}

// GUTENLYPSO START
export default withSelect( select => ( {
	hasFixedToolbar: select( 'core/edit-post' ).isFeatureActive( 'fixedToolbar' ),
	focusMode: select( 'core/edit-post' ).isFeatureActive( 'focusMode' ),
} ) )( Editor );
// GUTENLYPSO END
