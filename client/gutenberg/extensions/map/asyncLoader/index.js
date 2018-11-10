/** @format */

/**
 * External dependencies
 */

import isString from 'lodash/isString';

/**
 * Internal dependencies
 */

function _loadAsset( url ) {
	switch ( _extensionFromURL( url ) ) {
		case 'js':
			return _loadScript( url );
		case 'css':
			return _loadStylesheet( url );
	}
}

function _loadScript( url ) {
	return new Promise( ( resolve, reject ) => {
		const scriptElementsExisting = document.querySelectorAll( 'script' );
		let scriptElement = null;
		scriptElementsExisting.forEach( scriptElementExisting => {
			if ( url === scriptElementExisting.src ) {
				scriptElement = scriptElementExisting;
			}
		} );
		if ( scriptElement && scriptElement.getAttribute( 'data-loaded' ) ) {
			resolve( url );
			return;
		}
		if ( ! scriptElement ) {
			scriptElement = document.createElement( 'script' );
		}
		scriptElement.async = true;
		scriptElement.src = url;
		scriptElement.addEventListener( 'load', () => {
			scriptElement.setAttribute( 'data-loaded', true );
			resolve( url );
		} );
		scriptElement.addEventListener( 'error', () => {
			reject( url );
		} );
		document.body.appendChild( scriptElement );
	} );
}

function _loadStylesheet( url ) {
	return new Promise( ( resolve, reject ) => {
		const stylesheetElementsExisting = document.querySelectorAll( 'link' );
		let stylesheetElement = null;
		stylesheetElementsExisting.forEach( stylesheetElementExisting => {
			if ( url === stylesheetElementExisting.href ) {
				stylesheetElement = stylesheetElementExisting;
			}
		} );
		if ( stylesheetElement && stylesheetElement.getAttribute( 'data-loaded' ) ) {
			resolve( url );
			return;
		}
		if ( ! stylesheetElement ) {
			stylesheetElement = document.createElement( 'link' );
		}
		stylesheetElement.type = 'text/css';
		stylesheetElement.rel = 'stylesheet';
		stylesheetElement.href = url;
		stylesheetElement.addEventListener( 'load', () => {
			stylesheetElement.setAttribute( 'data-loaded', true );
			resolve( url );
		} );
		stylesheetElement.addEventListener( 'error', () => {
			reject( url );
		} );
		document.head.appendChild( stylesheetElement );
	} );
}

function _extensionFromURL( url ) {
	return url
		.split( '?' )
		.shift()
		.split( '.' )
		.pop();
}

function asyncLoader( urls = [], success, failure ) {
	const successfulLoades = [];
	const failedLoads = [];
	if ( isString( urls ) ) {
		urls = [ urls ];
	}
	urls.forEach( url => {
		_loadAsset( url ).then(
			response => {
				successfulLoades.push( response );
				if ( successfulLoades.length === urls.length ) {
					success( successfulLoades );
				}
			},
			response => {
				failedLoads.push( response );
				failure( failedLoads );
			}
		);
	} );
}

export default asyncLoader;
