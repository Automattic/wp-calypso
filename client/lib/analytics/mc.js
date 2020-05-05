/**
 * External dependencies
 */
import debug from 'debug';

/**
 * Internal dependencies
 */
import config from 'config';

const mcDebug = debug( 'calypso:analytics:mc' );

function buildQuerystring( group, name ) {
	let uriComponent = '';

	if ( 'object' === typeof group ) {
		for ( const key in group ) {
			uriComponent += '&x_' + encodeURIComponent( key ) + '=' + encodeURIComponent( group[ key ] );
		}
	} else {
		uriComponent = '&x_' + encodeURIComponent( group ) + '=' + encodeURIComponent( name );
	}

	return uriComponent;
}

function buildQuerystringNoPrefix( group, name ) {
	let uriComponent = '';

	if ( 'object' === typeof group ) {
		for ( const key in group ) {
			uriComponent += '&' + encodeURIComponent( key ) + '=' + encodeURIComponent( group[ key ] );
		}
	} else {
		uriComponent = '&' + encodeURIComponent( group ) + '=' + encodeURIComponent( name );
	}

	return uriComponent;
}

export function bumpStat( group, name ) {
	if ( 'object' === typeof group ) {
		mcDebug( 'Bumping stats %o', group );
	} else {
		mcDebug( 'Bumping stat %s:%s', group, name );
	}

	if ( config( 'mc_analytics_enabled' ) ) {
		const uriComponent = buildQuerystring( group, name );
		new window.Image().src =
			document.location.protocol +
			'//pixel.wp.com/g.gif?v=wpcom-no-pv' +
			uriComponent +
			'&t=' +
			Math.random();
	}
}

export function bumpStatWithPageView( group, name ) {
	// this function is fairly dangerous, as it bumps page views for wpcom and should only be called in very specific cases.
	if ( 'object' === typeof group ) {
		mcDebug( 'Bumping page view with props %o', group );
	} else {
		mcDebug( 'Bumping page view %s:%s', group, name );
	}

	if ( config( 'mc_analytics_enabled' ) ) {
		const uriComponent = buildQuerystringNoPrefix( group, name );
		new window.Image().src =
			document.location.protocol +
			'//pixel.wp.com/g.gif?v=wpcom' +
			uriComponent +
			'&t=' +
			Math.random();
	}
}
