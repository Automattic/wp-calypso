/**
 * External dependencies
 */
import { get, debounce } from 'lodash';
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
/* eslint-disable import/no-extraneous-dependencies */
import { useRef, useEffect, useState, useCallback } from '@wordpress/element';
import { withSelect } from '@wordpress/data';
import { compose, withSafeTimeout } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { Modal } from '@wordpress/components';
/* eslint-enable import/no-extraneous-dependencies */

// Debounce time applied to the on resize window event.
const DEBOUNCE_TIMEOUT = 300;

/**
 * Render an iframe loading the same page but
 * adding the 'framePreview=true' into the query string of the src value.
 * It will acts as a key to select the content to render.
 *
 * @param {object} props component's props
 * @param {object} props.className CSS class to apply to component
 * @param {number} props.viewportWidth pixel width of the viewable size of the preview
 * @param {object} props.blocksByTemplateSlug Parsed blocks, order by template slug.
 */
export const BlockFramePreview = ( {
	className = 'block-iframe-preview',
	viewportWidth,
	blocksByTemplateSlug = {},
	slug,
} ) => {
	const iframeRef = useRef();

	// Set the initial scale factor.
	const [ style, setStyle ] = useState( {
		transform: `scale( 1 )`,
	} );

	/**
	 * This function re scales the viewport depending on
	 * the wrapper and the iframe width.
	 */
	const rescale = useCallback( () => {
		const parentNode = get( iframeRef, [ 'current', 'parentNode' ] );
		if ( ! parentNode ) {
			return;
		}

		// Scaling iFrame.
		const width = viewportWidth || iframeRef.current.offsetWidth;
		const scale = parentNode.offsetWidth / viewportWidth;
		const height = parentNode.offsetHeight / scale;

		setStyle( {
			width,
			height,
			transform: `scale( ${ scale } )`,
		} );
	}, [ viewportWidth ] );

	// Initial settings.
	useEffect( () => {
		// Populate iframe window object with blocks
		// order by template slug.
		const frameWindow = get( iframeRef, [ 'current', 'contentWindow' ] );
		if ( frameWindow ) {
			frameWindow.blocksByTemplateSlug = blocksByTemplateSlug;
		}

		// Set initial scale and dims.
		rescale();
	}, [] );

	// Send slug to <BlockFrameContent />.
	useEffect( () => {
		if ( ! slug || ! blocksByTemplateSlug || ! blocksByTemplateSlug[ slug ] ) {
			return;
		}

		const frameWindow = get( iframeRef, [ 'current', 'contentWindow' ] );
		if ( ! frameWindow ) {
			return;
		}

		frameWindow.postMessage( slug, "*" );
	}, [ slug ] );

	// Handling windows resize event.
	useEffect( () => {
		const refreshPreview = debounce( rescale, DEBOUNCE_TIMEOUT );
		window.addEventListener( 'resize', refreshPreview );

		return () => {
			window.removeEventListener( 'resize', refreshPreview );
		};
	}, [ rescale ] );

	// Handle wp-admin specific `wp-collapse-menu` event to refresh the preview on sidebar toggle.
	useEffect( () => {
		if ( window.jQuery ) {
			window.jQuery( window.document ).on( 'wp-collapse-menu', rescale );
		}
		return () => {
			if ( window.jQuery ) {
				window.jQuery( window.document ).off( 'wp-collapse-menu', rescale );
			}
		};
	}, [ rescale ] );

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<iframe
			src="#framepreview=true"
			ref={ iframeRef }
			title={ __( 'Frame Preview' ) }
			className={ classnames( 'editor-styles-wrapper', className ) }
			style={ style }
		/>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
};

const _BlockFrameContent = () => {
	const [ slug, setSlug ] = useState();
	// Listening messages in order to get template slug.
	useEffect( () => {
		const receiveMessage = ( { data: slug } ) => {
			if ( ! slug || ! window.blocksByTemplateSlug || ! window.blocksByTemplateSlug[ slug ] ) {
				return;
			}
			setSlug( slug );
		};

		window.addEventListener( 'message', receiveMessage, false );

		return () => {
			window.removeEventListener( 'message', receiveMessage, false );
		};
	}, [] );

	return (
		<Modal
			className="frame-preview-modal"
			overlayClassName="frame-preview-modal-screen-overlay"
			shouldCloseOnClickOutside={ false }
			isDismissable={ false }
			isDismissible={ false }
		>
			<div className="block-editor block-frame-preview__container editor-styles-wrapper">
				<div className="edit-post-visual-editor">
					<div className="editor-writing-flow">Preview Content</div>
				</div>
			</div>
		</Modal>
	);
};

export const BlockFrameContent = compose(
	withSafeTimeout,
	withSelect( select => {
		const blockEditorStore = select( 'core/block-editor' );
		return {
			settings: blockEditorStore ? blockEditorStore.getSettings() : {},
		};
	} )
)( _BlockFrameContent );
