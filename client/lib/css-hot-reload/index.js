/**
 * External dependencies
 */
var io = require( 'socket.io-client' );

/**
 * Internal dependencies
 */
import { cssBuildFailed, cssBuilding } from 'state/application/actions';
import i18n from 'lib/mixins/i18n';

/**
 * @returns {boolean} 
 */
function isChanged( href, changedFiles ) {
	// "/calypso/style-debug.css?v=5a1db7fee7" -> "/calypso/style-debug.css"
	var css = href.split('?')[0];
	var i, re;
		
	for( i = 0; i < changedFiles.length; ++i ) {
		re = new RegExp( '/' + changedFiles[i] + '$' );
		if ( css.match( re ) ) {
			return true;
		}
	}
	
	return false;
}

var CssHotReload = {

	/**
	 * Initialize client CSS hot-reload handler
	 */
	init: function( reduxStore ) {

		var namespace = location.protocol + '//' + location.host + '/css-hot-reload';
		var socket = io.connect( namespace );

		socket.on( 'css-hot-reload', function( data ) {
			switch( data.status ) {
				case 'reload':
					// Turn HTMLCollection to standard list
					var elems = document.head.getElementsByTagName('LINK');
					elems = [].slice.call( elems );
					elems.forEach( function( elem ) { 
						if ( ( 'href' in elem ) && isChanged( elem.href, data.changedFiles ) ) {
							console.log( 'Reloading CSS: ', elem );
							// Remove old .css and insert new one in the same spot
							var newLink = document.createElement( 'LINK' );
							elem.parentNode.insertBefore( newLink, elem );
							elem.parentNode.removeChild( elem );
							newLink.rel = elem.rel;
							newLink.type = elem.type;
							newLink.sizes = elem.sizes;
							newLink.href = elem.href;
						}
					} );
					break;
				case 'building':
					reduxStore.dispatch( cssBuilding( i18n.translate( 'Building CSS...' ) ) );
					break
				case 'build-failed':
					reduxStore.dispatch( cssBuildFailed( i18n.translate( 'CSS build failed.' ) ) );
					break;
			}
		} );
	}
}

/**
 * Module exports
 */
module.exports = CssHotReload;
