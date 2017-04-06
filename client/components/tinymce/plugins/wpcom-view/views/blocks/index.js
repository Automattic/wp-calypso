/**
 * External dependencies
 */
import React from 'react';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
//import { parse } from './post-parser';

const debug = debugFactory( 'block-editor' );

const blockOpen = /<!-- wp:([a-z-]+) ([a-z: ]*) ?-->/g;
const blockClose = /<!-- \/wp -->/g;

export function match( content ) {
	blockOpen.lastIndex = 0;
	const openMatch = blockOpen.exec( content );

	if ( ! openMatch ) {
		debug( 'no openMatch', content );
		return;
	}

	blockClose.lastIndex = openMatch.index;
	debug( 'setting index', openMatch.index );
	const closeMatch = blockClose.exec( content );

	if ( ! closeMatch ) {
		debug( 'no closeMatch' );
		return;
	}

	const result = {
		index: openMatch.index,
		content: content.slice( openMatch.index, closeMatch.lastIndex ),
		text: content.slice(
				openMatch.index + openMatch[ 0 ].length,
				closeMatch.index ),
	};

	debug( 'result', result );
	return result;
}

export function serialize( content ) {
	return encodeURIComponent( content );
}

export function getComponent() {
	return View;
}

export function edit( editor, content ) {
	debug( 'edit' );
	editor.execCommand( 'wpcomContactForm', content );
}

function trimBreaks( text ) {
	return text
		.trim()
		.replace( /^<br \/>/, '' )
		.replace( /<br \/>$/, '' );
}

const blockStyle = {
	margin: '0.2em',
	padding: '0.3em',
	border: '1px dashed black',
};

function View( props ) {
	const { text } = match( props.content );
	const trimmed = trimBreaks( text );

	debug( 'View', props, trimmed );

	return <div style={ blockStyle }>{ trimmed }</div>;
}
