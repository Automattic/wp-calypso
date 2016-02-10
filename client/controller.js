/**
 * External Dependencies
 */
import ReactDom from 'react-dom';
import startsWith from 'lodash/startsWith';

/**
 * Internal dependencies
 */
import page from 'page';
import debugFactory from 'debug';

const debug = debugFactory( 'calypso:controller' );

export function clientRouter( route, ...mws ) {
	page( route, ...[ ...mws, renderElements ] );
}

export function renderElements( context ) {
	renderPrimary( context );
	renderSecondary( context );
}

function renderPrimary( context ) {
	const { path, primary } = context;

	// FIXME: temporary hack until we have a proper isomorphic, one tree
	// routing solution. Do NOT do this!
	const sheetsDomElement = startsWith( path, '/themes' ) &&
		document.getElementsByClassName( 'themes__sheet' )[0];

	if ( primary && ! sheetsDomElement ) {
		debug( 'Rendering primary', context, path, primary );
		ReactDom.render(
			primary,
			document.getElementById( 'primary' )
		);
	}
}

function renderSecondary( context ) {
	if ( context.secondary === null ) {
		debug( 'Unmounting secondary' );
		ReactDom.unmountComponentAtNode( document.getElementById( 'secondary' ) );
	} else if ( context.secondary !== undefined ) {
		debug( 'Rendering secondary' );
		ReactDom.render(
			context.secondary,
			document.getElementById( 'secondary' )
		);
	}
}
