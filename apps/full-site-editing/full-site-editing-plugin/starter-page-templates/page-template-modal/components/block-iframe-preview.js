/**
 * External dependencies
 */
import { each, filter, get, castArray, debounce } from 'lodash';
import { createPortal } from 'react-dom';
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
import { BlockEditorProvider, BlockList } from '@wordpress/block-editor';
import { Disabled } from '@wordpress/components';
/* eslint-enable import/no-extraneous-dependencies */

const THRESHOLD_RESIZE = 300;

/*
 * This function will populate the styles from the current document
 * to the given iFrame head and body DOM references.
 *
 * @param {object} els iFrame elements to populate: <head /> and <body />
 */
const loadStyles = iFrameDomRefereces => {
	each( Object.keys( iFrameDomRefereces ), domReference =>
		each(
			filter( window.document[ domReference ].children, ( { localName } ) =>
				[ 'link', 'style' ].includes( localName )
			),
			( { localName, attributes, innerHTML } ) => {
				const node = document.createElement( localName );
				each( attributes, ( { name, value } ) => ( node[ name ] = value ) );

				if ( innerHTML ) {
					node.innerHTML = innerHTML;
				}

				iFrameDomRefereces[ domReference ].appendChild( node );
			}
		)
	);
};

/**
 * Performs a blocks preview using an iFrame.
 *
 * @param {string} className
 * @param {string} bodyClassName
 * @param {number} viewportWidth
 * @param {Array}  blocks
 * @param {object} settings
 * @return {*}
 * @constructor
 */
const BlockFramePreview = ( {
	className = 'block-iframe-preview',
	bodyClassName = 'block-iframe-preview-body',
	viewportWidth,
	blocks,
	settings,
} ) => {
	const iFrameRef = useRef();

	// Set the initial scale factor.
	const [ style, setStyle ] = useState( {
		transform: `scale( 1 )`,
	} );

	// Rendering blocks list.
	const renderedBlocks = useMemo( () => castArray( blocks ), [ blocks ] );
	const [ recomputeBlockListKey, triggerRecomputeBlockList ] = useReducer( state => state + 1, 0 );
	useLayoutEffect( triggerRecomputeBlockList, [ blocks ] );

	// Set iFrame DOM reference.
	const [ iFrameBody, setIFrameBody ] = useState();

	// Populate iFrame styles.
	useEffect( () => {
		const head = get( iFrameRef, [ 'current', 'contentDocument', 'head' ] );
		const body = get( iFrameRef, [ 'current', 'contentDocument', 'body' ] );

		setIFrameBody( body );

		body.className = `${ bodyClassName } editor-styles-wrapper`;
		loadStyles( { head, body } );
		reScale();
	}, [] );

	// Scroll top the preview once it's rendered.
	useEffect( () => {
		if ( iFrameBody ) {
			iFrameBody.scrollTop = 0;
		}
	}, [ blocks ] );

	/**
	 * This function re scales the viewport depending on
	 * the wrapper and the iframe width.
	 */
	const reScale = useCallback( () => {
		const parentNode = get( iFrameRef, [ 'current', 'parentNode' ] );
		if ( ! parentNode ) {
			return;
		}

		// Scaling iFrame.
		const width = viewportWidth || iFrameRef.current.offsetWidth;
		const scale = parentNode.offsetWidth / viewportWidth;
		const height = parentNode.offsetHeight / scale;

		setStyle( {
			width,
			height,
			transform: `scale( ${ scale } )`,
		} );
	}, [] );

	// Handling windows resize event.
	useEffect( () => {
		const refreshPreview = debounce( reScale, THRESHOLD_RESIZE );
		window.addEventListener( 'resize', refreshPreview );

		// In wp-admin, listen to the jQuery `wp-collapse-menu` event to refresh the preview on sidebar toggle.
		if ( window.jQuery ) {
			window.jQuery( window.document ).on( 'wp-collapse-menu', reScale );
		}

		return () => {
			window.removeEventListener( 'resize', refreshPreview );
		};
	}, [] );

	return (
		<iframe
			ref={ iFrameRef }
			className={ classnames( 'editor-styles-wrapper', className ) }
			style={ style }
		>
			{ iFrameBody &&
				createPortal(
					<div className="block-editor">
						<div className="edit-post-visual-editor">
							<div className="editor-styles-wrapper">
								<div className="editor-writing-flow">
									{ blocks && blocks.length ? (
										<BlockEditorProvider value={ renderedBlocks } settings={ settings }>
											<Disabled key={ recomputeBlockListKey }>
												<BlockList />
											</Disabled>
										</BlockEditorProvider>
									) : null }
								</div>
							</div>
						</div>
					</div>,
					iFrameBody
				) }
		</iframe>
	);
};

export default withSelect( select => {
	return {
		settings: select( 'core/block-editor' ).getSettings(),
	};
} )( BlockFramePreview );
