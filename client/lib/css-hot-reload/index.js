/**
 * External dependencies
 */
import io from 'socket.io-client';

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
					elems.forEach( function( oldLink ) { 
						if ( ( 'href' in oldLink ) && isChanged( oldLink.href, data.changedFiles ) ) {
							console.log( 'Reloading CSS: ', oldLink );
							// Remove old .css and insert new one in the same spot
							var newLink = document.createElement( 'LINK' );
							oldLink.parentNode.insertBefore( newLink, oldLink );
							oldLink.parentNode.removeChild( oldLink );
							// Copy standard attributes
							// https://developer.mozilla.org/en/docs/Web/HTML/Element/link
							var attrs = [ 'crossorigin', 'href', 'hreflang',
										  'media', 'rel', 'sizes', 'title', 'type' ];
							attrs.forEach( function( attr ) {
								if ( attr in oldLink ) {
									if ( 'href' === attr ) {
										// Make sure it is reloaded
										var href = oldLink.href.split('?')[0];
										var hash = new Date().getTime().toString();
										href += '?v=' + hash;
										newLink.href = href;
									} else {
										newLink[ attr ] = oldLink[ attr ];
									}
								}
							} );
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
