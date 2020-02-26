/**
 * External dependencies
 */
import { each, filter, get } from 'lodash';
import { createPortal } from 'react-dom';
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
/* eslint-disable import/no-extraneous-dependencies */
import { useRef, useEffect, useState } from '@wordpress/element';
/* eslint-enable import/no-extraneous-dependencies */

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
	head,
	children,
	className= 'block-iframe-preview',
	bodyClassName = 'block-iframe-preview-body',
	viewportWidth,
} ) => {
	const iFrameRef = useRef();
	const [ style, setStyle ] = useState( {
		transform: `scale( 1 )`,
	} );

	const iFrameHead = get( iFrameRef, [ 'current', 'contentDocument', 'head' ] );
	const iFrameBody = get( iFrameRef, [ 'current', 'contentDocument', 'body' ] );

	useEffect( () => {
		if ( ! iFrameHead || ! iFrameBody ) {
			return;
		}
		iFrameBody.className = bodyClassName;

		loadStyles( iFrameHead, iFrameBody );

		const parentNode = get( iFrameRef, [ 'current', 'parentNode' ] );
		if ( ! parentNode ) {
			return;
		}

		const width = viewportWidth || iFrameRef.current.offsetWidth;
		const scale = parentNode.offsetWidth / viewportWidth;
		const height = parentNode.offsetHeight / scale;

		setStyle( {
			width,
			height,
			transform: `scale( ${ scale } )`,
		} );
	}, [ iFrameHead, iFrameHead ] );

	return (
		<iframe
			ref={ iFrameRef }
			className={ classnames(
				'editor-styles-wrapper',
				className,
			) }
			style={ style }
		>
			{ iFrameHead && createPortal( head, iFrameHead ) }
			{ iFrameBody && createPortal(
				<div className="block-editor">
					<div className="edit-post-visual-editor">
						<div className="editor-styles-wrapper">
							<div className="editor-writing-flow">{ children }</div>
						</div>
					</div>
				</div>,
				iFrameBody
			) }
		</iframe>
	);
};

export default BlockFramePreview;
