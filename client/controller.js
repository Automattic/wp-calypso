/**
 * External Dependencies
 */
import ReactDom from 'react-dom';
import startsWith from 'lodash/startsWith';

/**
 * Internal Dependencies
 */
 import sections from './sections';

export function ensureMiddleware( ctx, next ) {
	console.log( 'ensureMiddleware' );
	sections.loadSection( 'themes', () => {
		console.log( 'loaded!' );
		next();
	} );
}

export function renderElements( context ) {
	renderPrimary( context );
	renderSecondary( context );
}

function renderPrimary( context ) {
	const { path } = context.params;
	// FIXME: temporary hack until we have a proper isomorphic, one tree routing solution. Do NOT do this!
	const sheetsDomElement = startsWith( path, '/themes' ) && document.getElementsByClassName( 'themes__sheet' )[0];
	const mainDomElement = startsWith( path, '/design' ) && document.getElementsByClassName( 'themes main' )[0];
	if ( ! sheetsDomElement && ! mainDomElement ) {
		ReactDom.render(
			context.primary,
			document.getElementById( 'primary' )
		);
	}
}

function renderSecondary( context ) {
	if ( context.secondary === null ) {
		ReactDom.unmountComponentAtNode( document.getElementById( 'secondary' ) );
	} else if ( context.secondary !== undefined ) {
		ReactDom.render(
			context.secondary,
			document.getElementById( 'secondary' )
		);
	}
}
