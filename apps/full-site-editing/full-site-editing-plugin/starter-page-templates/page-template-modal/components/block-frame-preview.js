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
import { __ } from '@wordpress/i18n';
/* eslint-enable import/no-extraneous-dependencies */

// Debounce time applied to the on resize window event.
const DEBOUNCE_TIMEOUT = 300;

/**
 * Render an iframe loading the same page but
 * adding the 'framePreview=true' into the query string of the src value.
 * It will acts as a key to select the content to render.
 *
 * @param {object} props component's props
 * @param {object} props.className     CSS class to apply to component
 * @param {number} props.viewportWidth Pixel width of the viewable size of the preview
 * @param {object} props.template      Raw template content.
 */
export default ( { className = 'block-frame-preview', viewportWidth, template, slug, title } ) => {
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
	useEffect( rescale, [] );

	// Send slug to <BlockFrameContent />.
	useEffect( () => {
		if ( ! slug || ! template ) {
			return;
		}

		const frameWindow = get( iframeRef, [ 'current', 'contentWindow' ] );
		if ( ! frameWindow ) {
			return;
		}

		frameWindow.postMessage( { slug, title, isFramePreview: true, template }, '*' );
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
			src="http://localhost/wp-admin/options-general.php?page=editor-layout-preview"
			ref={ iframeRef }
			title={ __( 'Frame Preview' ) }
			className={ classnames( 'editor-styles-wrapper', className ) }
			style={ style }
		/>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
};
