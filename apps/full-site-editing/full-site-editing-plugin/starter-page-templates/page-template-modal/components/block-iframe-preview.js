/**
 * External dependencies
 */
import { get, debounce, castArray } from 'lodash';
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
/* eslint-disable import/no-extraneous-dependencies */
import {
	useRef,
	useEffect,
	useState,
	useCallback,
	useLayoutEffect,
	useMemo,
	useReducer,
} from '@wordpress/element';
import { withSelect } from '@wordpress/data';
import { compose, withSafeTimeout } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { Modal } from '@wordpress/components';
/* eslint-enable import/no-extraneous-dependencies */

/**
 * Internal dependencies
 */
import CustomBlockPreview from './block-preview';

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
	title,
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

		frameWindow.postMessage( { slug, title, isFramePreview: true }, '*' );
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

	const joinSymbol = window.document.location.href.match( /\?/ ) ? '&' : '?';

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<iframe
			src={ `${ window.document.location.href }${ joinSymbol }framepreview=true` }
			ref={ iframeRef }
			title={ __( 'Frame Preview' ) }
			className={ classnames( 'editor-styles-wrapper', className ) }
			style={ style }
		/>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
};

/**
 * Giving the template slug, it will return the parsed blocks,
 * or an empty array.
 *
 * @param {string} slug Template slug.
 * @return {Array} Templates Blocks if template exists. Otherwise, an empty array.
 */
const getBlocksByTemplateSlug = slug => {
	return get( window, [ 'blocksByTemplateSlug', slug ], [] );
};

const _BlockFrameContent = ( { settings } ) => {
	const [ slug, setSlug ] = useState();
	const [ title, setTitle ] = useState();

	/*
	 * Listening messages in order to get template slug.
	 * Check if the template exists.
	 */
	useEffect( () => {
		const receiveMessage = ( { data } ) => {
			const { slug, isFramePreview, title } = data;
			if ( ! isFramePreview ) {
				return;
			}

			const blocks = getBlocksByTemplateSlug( slug );
			if ( ! blocks || ! blocks.length ) {
				return;
			}

			setSlug( slug );
			setTitle( title );
		};

		window.addEventListener( 'message', receiveMessage, false );

		return () => {
			window.removeEventListener( 'message', receiveMessage, false );
		};
	}, [] );

	const blocks = useMemo( () => castArray( getBlocksByTemplateSlug( slug ) ), [ slug ] );
	const [ recomputeBlockListKey, triggerRecomputeBlockList ] = useReducer( state => state + 1, 0 );
	useLayoutEffect( triggerRecomputeBlockList, [ slug ] );

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
					<div className="editor-styles-wrapper">
						<div className="editor-writing-flow">
							<CustomBlockPreview
								blocks={ blocks }
								settings={ settings }
								hidePageTitle={ ! title }
								recomputeBlockListKey={ recomputeBlockListKey }
							/>
						</div>
					</div>
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
