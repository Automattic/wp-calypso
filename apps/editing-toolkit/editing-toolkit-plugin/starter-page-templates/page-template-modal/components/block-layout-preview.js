/**
 * External dependencies
 */
import { get, castArray, debounce } from 'lodash';
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import {
	useRef,
	useEffect,
	useState,
	useMemo,
	useReducer,
	useLayoutEffect,
	useCallback,
} from '@wordpress/element';
import { withSelect } from '@wordpress/data';
import { compose, withSafeTimeout } from '@wordpress/compose';

import CustomBlockPreview from './block-preview';

// Debounce time applied to the on resize window event.
const DEBOUNCE_TIMEOUT = 300;

/**
 * A blocks layout preview.
 *
 * @param {object} props component's props
 * @param {object} props.className CSS class to apply to component
 * @param {string} props.bodyClassName CSS class to apply to the preview body
 * @param {number} props.viewportWidth pixel width of the viewable size of the preview
 * @param {Array} props.blocks array of Gutenberg Block objects
 * @param {object} props.settings block Editor settings object
 * @param {string} props.title Template Title - see #39831 for details.
 */
const BlockLayoutPreview = ( {
	className = 'spt-block-layout-preview',
	bodyClassName = 'spt-block-layout-preview-body',
	viewportWidth,
	blocks,
	settings,
	title,
} ) => {
	const frameContainerRef = useRef();

	// Set the initial scale factor.
	const [ style, setStyle ] = useState( {
		transform: `scale( 1 )`,
	} );

	// Rendering blocks list.
	const renderedBlocks = useMemo( () => castArray( blocks ), [ blocks ] );
	const [ recomputeBlockListKey, triggerRecomputeBlockList ] = useReducer(
		( state ) => state + 1,
		0
	);
	useLayoutEffect( triggerRecomputeBlockList, [ blocks ] );

	/**
	 * This function re scales the viewport depending on
	 * the wrapper and the iframe width.
	 */
	const rescale = useCallback( () => {
		const parentNode = get( frameContainerRef, [ 'current', 'parentNode' ] );
		if ( ! parentNode ) {
			return;
		}

		// Scaling iFrame.
		const width = viewportWidth || frameContainerRef.current.offsetWidth;
		const scale = parentNode.offsetWidth / viewportWidth;
		const height = parentNode.offsetHeight / scale;

		setStyle( {
			width,
			height,
			transform: `scale( ${ scale } )`,
		} );
	}, [ viewportWidth ] );

	/*
	 * Temporarily manually set the PostTitle from DOM.
	 * It isn't currently possible to manually force the `<PostTitle />` component
	 * to render a title provided as a prop. A Core PR will rectify this (see below).
	 * Until then we use direct DOM manipulation to set the post title.
	 *
	 * See: https://github.com/WordPress/gutenberg/pull/20609/
	 */
	useEffect( () => {
		if ( ! title ) {
			return;
		}

		const previewBody = document.querySelector( `.${ className }` );

		if ( ! previewBody ) {
			return;
		}

		const templateTitle = previewBody.querySelector(
			'.editor-post-title .editor-post-title__input'
		);

		if ( ! templateTitle ) {
			return;
		}

		templateTitle.value = title;
	}, [ recomputeBlockListKey ] );

	// Scroll the preview to the top when the blocks change.
	useEffect( () => {
		const templatePreview = document.querySelector( `.${ className }` );
		if ( ! templatePreview ) {
			return;
		}

		// scroll to top when blocks changes.
		templatePreview.scrollTop = 0;
	}, [ recomputeBlockListKey ] );

	// Handling windows resize event.
	useEffect( () => {
		const refreshPreview = debounce( rescale, DEBOUNCE_TIMEOUT );
		window.addEventListener( 'resize', refreshPreview );

		// Call once initially to ensure layouts are set to the correct scale at the outset.
		rescale();

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
		<div ref={ frameContainerRef }>
			<div
				className={ classnames( 'editor-styles-wrapper', className, bodyClassName ) }
				style={ style }
			>
				<div className="block-editor">
					<div className="edit-post-visual-editor">
						<div className="editor-styles-wrapper">
							<div className="editor-writing-flow">
								<CustomBlockPreview
									blocks={ renderedBlocks }
									settings={ settings }
									hidePageTitle={ ! title }
									recomputeBlockListKey={ recomputeBlockListKey }
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
};

export default compose(
	withSafeTimeout,
	withSelect( ( select ) => {
		const blockEditorStore = select( 'core/block-editor' );
		return {
			settings: blockEditorStore ? blockEditorStore.getSettings() : {},
		};
	} )
)( BlockLayoutPreview );
