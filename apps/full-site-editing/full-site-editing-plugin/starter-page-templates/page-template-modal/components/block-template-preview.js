/**
 * External dependencies
 */
import { each, get, filter } from 'lodash';

/**
 * WordPress dependencies
 */
/* eslint-disable import/no-extraneous-dependencies */
import { BlockPreview } from '@wordpress/block-editor';
import { useCallback, Fragment } from '@wordpress/element';
/* eslint-enable import/no-extraneous-dependencies */

const BlockTemplatePreview = ( { blocks = [], viewportWidth } ) => {
	/*
	 * It injects an Iframe between the scaled element and the blocks container.
	 */
	const movePreviewToIFrame = useCallback(
		( { previewContainerRef } ) => {
			const { current: previewWrapper } = previewContainerRef;
			if ( ! previewWrapper ) {
				return;
			}
			const scaledPreviewViewport = previewWrapper.getElementsByClassName(
				'block-editor-block-preview__content'
			)[ 0 ];
			const scaledPreviewViewportChild = scaledPreviewViewport.children[ 0 ];

			const iFrameWrapper = document.createElement( 'iframe' );
			iFrameWrapper.className = 'block-preview-iframe';
			scaledPreviewViewport.appendChild( iFrameWrapper );

			const iFrameHead = get( iFrameWrapper, [ 'contentWindow', 'document', 'head' ] );
			const iFrameBody = get( iFrameWrapper, [ 'contentWindow', 'document', 'body' ] );
			iFrameBody.className = `block-preview-iframe-body ${ ! blocks.length ? 'not-selected' : '' }`;

			const iFrameWrapperLevel01 = document.createElement( 'div' );
			iFrameWrapperLevel01.className = 'edit-post-visual-editor';
			iFrameBody.appendChild( iFrameWrapperLevel01 );

			const iFrameWrapperLevel02 = document.createElement( 'div' );
			iFrameWrapperLevel02.className = 'editor-styles-wrapper';
			iFrameWrapperLevel01.appendChild( iFrameWrapperLevel02 );

			const iFrameWrapperLevel03 = document.createElement( 'div' );
			iFrameWrapperLevel03.className = 'editor-writing-flow';
			iFrameWrapperLevel02.appendChild( iFrameWrapperLevel03 );

			// Populate styles to iFrame element.
			each(
				filter(
					document.querySelectorAll( 'head link' ),
					( { rel, href } ) => rel && rel === 'stylesheet' && href.match( /wp-content/ ) // only move styles from wp-content
				),
				( { href } ) => {
					const iFrameLink = document.createElement( 'link' );
					iFrameLink.rel = 'stylesheet';
					iFrameLink.type = 'text/css';
					iFrameLink.href = href.replace( /http:\/\/localhost\//, '../' );
					iFrameHead.appendChild( iFrameLink );
				}
			);

			iFrameWrapperLevel03.appendChild( scaledPreviewViewportChild );
			iFrameWrapper.style.height = iFrameBody.scrollHeight + 'px';
		},
		[ blocks ]
	);

	return (
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		<Fragment>
			<BlockPreview
				blocks={ blocks }
				viewportWidth={ viewportWidth }
				__experimentalOnReady={ movePreviewToIFrame }
			/>
		</Fragment>
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	);
};

export default BlockTemplatePreview;
