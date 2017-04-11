/**
 * Internal dependencies
 */
import { deserialize } from 'lib/media-serialization';
import resize from 'lib/resize-image-url';

/**
 * Module variables
 */
const REGEXP_ORIGINAL_IMG = /(<img[^>]*?\ssrc=")([^"]*?)("[^>]*?\/?>)/ig;
const REGEXP_REPLACED_IMG = /(<img[^>]*?\ssrc=")([^"]*?)("[^>]*?)(\sdata-wpmedia-src="([^"]*?)")([^>]*?\/?>)/ig;
const MEDIA_RETINA = '( -webkit-min-device-pixel-ratio: 1.5 ), ( min--moz-device-pixel-ratio: 1.5 ), ( min-resolution: 1.5dppx )';
const BASE_MAX_WIDTH = 680;
const MAX_WIDTH = getMaxWidth();

export function getMaxWidth() {
	if ( isFinite( window.devicePixelRatio ) ) {
		return Math.round( BASE_MAX_WIDTH * window.devicePixelRatio );
	}

	if ( window.matchMedia && window.matchMedia( MEDIA_RETINA ).matches ) {
		return Math.round( BASE_MAX_WIDTH * 2 );
	}

	return BASE_MAX_WIDTH;
}

function resetImageSrc( img, opening, src, attributes, origAttr, origSrc, closing ) {
	return `${ opening }${ origSrc }${ attributes }${ closing }`;
}

function setImageSrc( img, opening, src, closing ) {
	if ( -1 !== img.indexOf( 'data-wpmedia-src' ) ) {
		return img;
	}

	const parsed = deserialize( img );
	if ( parsed.media.transient || ! parsed.media.ID ) {
		return img;
	}

	const url = resize( parsed.media.URL, Math.min( parsed.media.width || Infinity, MAX_WIDTH ) );
	return `${ opening }${ url }" data-wpmedia-src="${ parsed.media.URL }${ closing }`;
}

export function resetImages( content ) {
	return content.replace( REGEXP_REPLACED_IMG, resetImageSrc );
}

export function setImages( content ) {
	return content.replace( REGEXP_ORIGINAL_IMG, setImageSrc );
}

export default function( editor ) {
	editor.on( 'BeforeSetContent BeforeSetWpcomMedia', ( event ) => {
		if ( ! event.content || 'html' === event.mode ) {
			return;
		}

		event.content = setImages( event.content );
	} );

	editor.on( 'GetContent', ( event ) => {
		if ( event.format !== 'raw' || ! event.content || event.selection ) {
			return;
		}

		event.content = resetImages( event.content );
	} );

	editor.on( 'PostProcess', ( event ) => {
		if ( ! event.content ) {
			return;
		}

		event.content = resetImages( event.content );
	} );

	editor.on( 'BeforeAddUndo', ( event ) => {
		if ( ! event.level.content ) {
			return;
		}

		event.level.content = resetImages( event.level.content );
	} );
}
