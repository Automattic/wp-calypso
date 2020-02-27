/**
 * External dependencies
 */
import _ from 'lodash';
import { createPortal } from 'react-dom';
import classnames from 'classnames';
import { render } from 'react-dom';

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

const { each, filter, get, castArray, debounce } = _;
const THRESHOLD_RESIZE = 300;

/**
 * This function will populate the styles from the current document
 * to the given `<head />` and `<boby />` arguments.
 *
 * @param {Element} iFrameHead iframe <head /> element.
 * @param {Element} iFrameBody iframe <body /> element.
 */
const loadStyles = ( iFrameHead, iFrameBody ) => {
	each(
		filter(
			document.querySelectorAll( 'head link' ),
			( { rel, href } ) => rel && rel === 'stylesheet' && href.match( /wp-content/ ) // only move styles from wp-content
		),
		( { href } ) => {
			const iFrameLink = document.createElement( 'link' );
			iFrameLink.rel = 'stylesheet';
			iFrameLink.type = 'text/css';
			iFrameLink.href = href;
			iFrameHead.appendChild( iFrameLink );
		}
	);

	each( filter( document.querySelectorAll( 'head style' ) ), ( { innerHTML } ) => {
		const iFrameHeadStyle = document.createElement( 'style' );
		iFrameHeadStyle.innerHTML = innerHTML;
		iFrameHead.appendChild( iFrameHeadStyle );
	} );

	each( filter( document.querySelectorAll( 'body style' ) ), ( { innerHTML } ) => {
		const iFrameStyle = document.createElement( 'style' );
		iFrameStyle.innerHTML = innerHTML;
		iFrameBody.appendChild( iFrameStyle );
	} );

	each(
		window.document.head.children,
		( { localName, type, src, innerHTML, outerHTML, href, ref, id } ) => {
			const node = document.createElement( localName );
			switch ( localName ) {
				case 'link':
					node.id = id;
					node.href = href;
					node.ref = ref;
					iFrameHead.appendChild( node );
					console.log( { node } );

					break;
				case 'script':
					node.type = type;

					// script loaded by source.
					if ( src ) {
						node.src = src;
					}

					// script defined in the code.
					if ( innerHTML ) {
						node.innerHTML = innerHTML;
					}
					iFrameHead.appendChild( node );

					console.log( { node } );

					break;

				default:
					break;
			}
		}
	);

	each(
		window.document.body.children,
		( { localName, type, src, innerHTML, outerHTML, href, ref, id } ) => {
			const node = document.createElement( localName );
			switch ( localName ) {
				case 'link':
					node.id = id;
					node.href = href;
					node.ref = ref;
					iFrameBody.appendChild( node );
					console.log( { node } );

					break;
				case 'script':
					node.type = type;

					// script loaded by source.
					if ( src ) {
						node.src = src;
					}

					// script defined in the code.
					if ( innerHTML ) {
						node.innerHTML = innerHTML;
					}
					iFrameBody.appendChild( node );

					console.log( { node } );

					break;

				default:
					break;
			}
		}
	);
};

const BlockFramePreview = ( {
	className = 'block-iframe-preview',
	bodyClassName = 'block-iframe-preview-body',
	viewportWidth,
	blocks,
	settings,
} ) => {
	const iFrameRef = useRef();
	const [ style, setStyle ] = useState( {
		transform: `scale( 1 )`,
	} );

	// Rendering blocks list.
	const renderedBlocks = useMemo( () => castArray( blocks ), [ blocks ] );
	const [ recomputeBlockListKey, triggerRecomputeBlockList ] = useReducer( state => state + 1, 0 );
	useLayoutEffect( triggerRecomputeBlockList, [ blocks ] );

	const [ iFrameBody, setIFrameBody ] = useState();

	useEffect( () => {
		console.log( { iFrameRef } );

		const iFrameHead = get( iFrameRef, [ 'current', 'contentDocument', 'head' ] );
		const iFrameBody = get( iFrameRef, [ 'current', 'contentDocument', 'body' ] );

		// Pick up iFrame <head /> and <body />
		setIFrameBody( iFrameBody );

		iFrameBody.className = bodyClassName;

		iFrameRef.current.contentWindow._ = Object.assign( {}, _ );
		console.log( iFrameRef.current.contentWindow._ );

		iFrameRef.current.contentWindow.moment = window.moment;
		iFrameRef.current.contentWindow.jQuery = window.jQuery;
		iFrameRef.current.contentWindow.wpWidgets = window.wpWidgets;
		iFrameRef.current.contentWindow.tinymce = window.tinymce;

		// Populate wp object to iFrame.
		iFrameRef.current.contentWindow.wp = {
			i18n: window.wp.i18n,
			apiFetch: window.wp.apiFetch,
			mediaWidgets: window.wp.mediaWidgets,
			data: window.wp.data,
			blocks: window.wp.blocks,
			date: window.wp.date,
			textWidgets: window.wp.textWidgets,
			codeEditor: window.wp.codeEditor,
			customHtmlWidgets: window.wp.customHtmlWidgets,
			domReady: window.wp.domReady,
			editPost: window.wp.editPost,
		};

		loadStyles( iFrameHead, iFrameBody );
		reScale();
	}, [] );

	useEffect( () => {
		if ( iFrameBody ) {
			iFrameBody.scrollTop = 0;
		}
	}, [ blocks ] );

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
									<BlockEditorProvider value={ renderedBlocks } settings={ settings }>
										<Disabled key={ recomputeBlockListKey }>
											<BlockList />
										</Disabled>
									</BlockEditorProvider>
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
