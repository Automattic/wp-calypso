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
		const iFrameHead = get( iFrameRef, [ 'current', 'contentDocument', 'head' ] );
		const iFrameBody = get( iFrameRef, [ 'current', 'contentDocument', 'body' ] );

		// Pick up iFrame <head /> and <body />
		setIFrameBody( iFrameBody );

		iFrameBody.className = bodyClassName;
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
