/**
 * External dependencies
 */
import React, { useState, useEffect } from 'react';

window.React = React;

/**
 * WordPress dependencies
 */
import '@wordpress/core-data';
import '@wordpress/viewport';
import '@wordpress/notices';
import '@wordpress/edit-post';

import { BlockContextProvider, BlockEditorProvider } from '@wordpress/block-editor';
import { Popover, SlotFillProvider, DropZoneProvider } from '@wordpress/components';
import { registerCoreBlocks } from '@wordpress/block-library';
import { parse } from '@wordpress/blocks';
import '@wordpress/format-library';
import { useDispatch } from '@wordpress/data';

import '@wordpress/components/build-style/style.css';
import '@wordpress/block-editor/build-style/style.css';
import '@wordpress/block-library/build-style/style.css';
import '@wordpress/block-library/build-style/editor.css';
import '@wordpress/block-library/build-style/theme.css';
import '@wordpress/format-library/build-style/style.css';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import EditorDocumentHead from 'post-editor/editor-document-head';
import { Placeholder } from './placeholder';
import './without-iframe.scss';
import PerformanceTrackerStop from 'lib/performance-tracking/performance-tracker-stop';
import Layout from '@wordpress/edit-post/src/components/layout';

const getStatsPath = ( { postId } ) =>
	postId
		? '/block-editor/without-iframe/:post_type/:site/:post_id'
		: '/block-editor/without-iframe/:post_type/:site';

const getStatsTitle = ( { postId, postType } ) => {
	let postTypeText;

	switch ( postType ) {
		case 'post':
			postTypeText = 'Post';
			break;
		case 'page':
			postTypeText = 'Page';
			break;
		default:
			postTypeText = 'Custom Post Type';
			break;
	}

	return postId
		? `Block Editor > ${ postTypeText } > Edit`
		: `Block Editor > ${ postTypeText } > New`;
};

const getStatsProps = ( { postId, postType } ) =>
	postId ? { post_type: postType, post_id: postId } : { post_type: postType };

function Gutenberg( props ) {
	const { postId, siteId, postType } = props;
	const [ post, setPost ] = useState( null );
	const [ blocks, updateBlocks ] = useState( null );

	const { toggleFeature } = useDispatch( 'core/edit-post' );
	const { setupEditor } = useDispatch( 'core/editor' );

	useEffect( () => {
		registerCoreBlocks();
		toggleFeature( 'fullscreenMode' );
	}, [ toggleFeature ] );

	useEffect( () => {
		// retrieve the full post description including "raw" content to access block markup
		wpcom.site( siteId ).post( postId ).get( { context: 'edit' } ).then( setPost );
	}, [ postId, siteId ] );

	useEffect( () => {
		if ( ! post ) {
			return;
		}

		setupEditor( post, {} );

		const parsedBlocks = parse( post.content );
		// give the blocks and initial fake clientId of their starting index.
		updateBlocks( parsedBlocks );
	}, [ post, setupEditor ] );

	if ( ! post || ! blocks ) {
		return <Placeholder />;
	}

	return (
		<>
			<PageViewTracker
				path={ getStatsPath( props ) }
				title={ getStatsTitle( props ) }
				properties={ getStatsProps( props ) }
			/>
			<EditorDocumentHead />
			<PerformanceTrackerStop />

			<div className="editor__without-iframe" role="main">
				<h1>Gutenberg In Calypso</h1>

				<SlotFillProvider>
					<DropZoneProvider>
						<BlockContextProvider value={ { postId, postType } }>
							<BlockEditorProvider
								value={ blocks }
								onInput={ updateBlocks }
								onChange={ updateBlocks }
							>
								<Layout />
								<Popover.Slot />
							</BlockEditorProvider>
						</BlockContextProvider>
					</DropZoneProvider>
				</SlotFillProvider>
			</div>
		</>
	);
}

export default Gutenberg;
