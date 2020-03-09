/**
 * External dependencies
 */
/* eslint-disable import/no-extraneous-dependencies */
import { castArray } from 'lodash';
import debugFactory from 'debug';
/* eslint-enable import/no-extraneous-dependencies */

/**
 * WordPress dependencies
 */
/* eslint-disable import/no-extraneous-dependencies */
import { withSelect } from '@wordpress/data';
import { compose, withSafeTimeout } from '@wordpress/compose';
import { useMemo, useEffect, useState } from '@wordpress/element';
import { BlockEditorProvider, BlockList } from '@wordpress/block-editor';
import { Disabled } from '@wordpress/components';
import { parse as parseBlocks } from '@wordpress/blocks';
/* eslint-enable import/no-extraneous-dependencies */

const debug = debugFactory( 'editor-layout-preview:render' );

// Load testing layout.
import testingLayout from '../util/testing_layout';

const LayoutPreview = ( { settings } ) => {
	const [ slug, setSlug ] = useState();
	const [ title, setTitle ] = useState();
	const [ layout, setLayout ] = useState( testingLayout );

	useEffect( () => {
		const receiveMessage = ( { data } ) => {
			const {
				isFramePreview,
				slug: layoutSlug,
				template: layoutRawContent,
				title: layoutTitle,
			} = data;

			if ( ! isFramePreview || isFramePreview !== true ) {
				return;
			}

			if ( ! layoutSlug || ! layoutRawContent ) {
				return;
			}

			setSlug( layoutSlug );
			setTitle( layoutTitle );
			setLayout( layoutRawContent );

			debug( 'layout: %s (%s)', title, slug );
		};

		window.addEventListener( 'message', receiveMessage, false );

		return () => {
			window.removeEventListener( 'message', receiveMessage, false );
		};
	}, [] );

	const blocks = useMemo( () => castArray( parseBlocks( layout ) ), [ layout ] );

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<div className="block-editor block-frame-preview__container editor-styles-wrapper">
			<div className="edit-post-visual-editor">
				<div className="editor-styles-wrapper">
					<div className="editor-writing-flow">
						<Disabled>
							<BlockEditorProvider value={ blocks } settings={ settings }>
								<BlockList />
							</BlockEditorProvider>
						</Disabled>
					</div>
				</div>
			</div>
		</div>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
};

export default compose(
	withSafeTimeout,
	withSelect( select => {
		const blockEditorStore = select( 'core/block-editor' );
		return {
			settings: blockEditorStore ? blockEditorStore.getSettings() : {},
		};
	} )
)( LayoutPreview );
