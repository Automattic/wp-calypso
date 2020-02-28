/**
 * External dependencies
 */
import { each, filter, get, castArray, debounce, noop } from 'lodash';
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
/* eslint-disable import/no-extraneous-dependencies */
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

import { __ } from '@wordpress/i18n';
/* eslint-enable import/no-extraneous-dependencies */

import CustomBlockPreview from './block-preview';

// Debounce time applied to the on resize window event.
const DEBOUNCE_TIMEOUT = 300;

/**
 * Copies the styles from the provided src document
 * to the given iFrame head and body DOM references.
 *
 * @param {object} srcDocument the src document from which to copy the
 * `link` and `style` Nodes from the `head` and `body`
 * @param {object} targetiFrameDocument the target iframe's
 * `contentDocument` where the `link` and `style` Nodes from the `head` and
 * `body` will be copied
 */
const copyStylesToIframe = ( srcDocument, targetiFrameDocument ) => {
	const styleNodes = [ 'link', 'style' ];

	// See https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment
	const targetDOMFragment = {
		head: new DocumentFragment(), // eslint-disable-line no-undef
		body: new DocumentFragment(), // eslint-disable-line no-undef
	};

	each( Object.keys( targetDOMFragment ), domReference => {
		return each(
			filter( srcDocument[ domReference ].children, ( { localName } ) =>
				// Only return specific style-related Nodes
				styleNodes.includes( localName )
			),
			targetNode => {
				// Clone the original node and append to the appropriate Fragement
				const deep = true;
				targetDOMFragment[ domReference ].appendChild( targetNode.cloneNode( deep ) );
			}
		);
	} );

	// Consolidate updates to iframe DOM
	targetiFrameDocument.head.appendChild( targetDOMFragment.head );
	targetiFrameDocument.body.appendChild( targetDOMFragment.body );
};

/**
 * Performs a blocks preview using an iFrame.
 *
 * @param {object} props component's props
 * @param {object} props.className CSS class to apply to component
 * @param {string} props.bodyClassName CSS class to apply to the iframe's `<body>` tag
 * @param {number} props.viewportWidth pixel width of the viewable size of the preview
 * @param {Array}  props.blocks array of Gutenberg Block objects
 * @param {object} props.settings block Editor settings object
 * @param {Function} props.setTimeout safe version of window.setTimeout via `withSafeTimeout`
 */
const BlockFramePreview = ( {
	className = 'block-iframe-preview',
	bodyClassName = 'block-iframe-preview-body',
	viewportWidth,
	blocks,
	settings,
	setTimeout = noop,
} ) => {
	const frameContainerRef = useRef();
	const renderedBlocksRef = useRef();
	const iframeRef = useRef();

	// Set the initial scale factor.
	const [ style, setStyle ] = useState( {
		transform: `scale( 1 )`,
	} );

	// Rendering blocks list.
	const renderedBlocks = useMemo( () => castArray( blocks ), [ blocks ] );
	const [ recomputeBlockListKey, triggerRecomputeBlockList ] = useReducer( state => state + 1, 0 );
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

	// Populate iFrame styles.
	useEffect( () => {
		setTimeout( () => {
			copyStylesToIframe( window.document, iframeRef.current.contentDocument );
			iframeRef.current.contentDocument.body.classList.add( bodyClassName );
			iframeRef.current.contentDocument.body.classList.add( 'editor-styles-wrapper' );
			rescale();
		}, 0 );
	}, [ setTimeout, bodyClassName, rescale ] );

	// Scroll the preview to the top when the blocks change.
	useEffect( () => {
		const body = get( iframeRef, [ 'current', 'contentDocument', 'body' ] );
		if ( ! body ) {
			return;
		}

		// scroll to top when blocks changes.
		body.scrollTop = 0;
	}, [ recomputeBlockListKey ] );

	// Append rendered Blocks to iFrame when changed
	useEffect( () => {
		const renderedBlocksDOM = renderedBlocksRef && renderedBlocksRef.current;

		if ( renderedBlocksDOM ) {
			iframeRef.current.contentDocument.body.appendChild( renderedBlocksDOM );
		}
	}, [ recomputeBlockListKey ] );

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
		<div ref={ frameContainerRef }>
			<iframe
				ref={ iframeRef }
				title={ __( 'Preview' ) }
				className={ classnames( 'editor-styles-wrapper', className ) }
				style={ style }
			/>

			<div ref={ renderedBlocksRef } className="block-editor" id="rendered-blocks">
				<div className="edit-post-visual-editor">
					<div className="editor-styles-wrapper">
						<div className="editor-writing-flow">
							{ blocks && blocks.length ? (
								<CustomBlockPreview
									blocks={ renderedBlocks }
									settings={ settings }
									recomputeBlockListKey={ recomputeBlockListKey }
								/>
							) : null }
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
	withSelect( select => {
		const blockEditorStore = select( 'core/block-editor' );
		return {
			settings: blockEditorStore ? blockEditorStore.getSettings() : {},
		};
	} )
)( BlockFramePreview );
