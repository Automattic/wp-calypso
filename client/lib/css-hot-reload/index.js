/**
 * /* eslint-disable no-console
 *
 * @format
 */

/**
 * External dependencies
 */
import io from 'socket.io-client';

// https://developer.mozilla.org/en/docs/Web/HTML/Element/link
const standardAttributes = [
	'crossorigin',
	'href',
	'hreflang',
	'media',
	'rel',
	'sizes',
	'title',
	'type',
];

/**
 * Replaces the old hash parameter with the current timestamp if `name` is `href`.
 * @return {Object}
 */
function bustHashForHrefs( { name, oldValue } ) {
	// http://some.site.com/and/a/path?with=a&query -> http://some.site.com/and/a/path?v=13508135781
	const value =
		'href' === name ? `${ oldValue.split( '?' ).shift() }?v=${ new Date().getTime() }` : oldValue;

	return { name, value };
}

/**
 * @return {Boolean}
 */
function isChanged( href, changedFiles ) {
	// "/calypso/style-debug.css?v=5a1db7fee7" -> "style-debug.css"
	const path = href
		.split( '?' )
		.shift()
		.split( '/' )
		.pop();

	return changedFiles.some( file => file === path );
}

/**
 * Initialize client CSS hot-reload handler
 */
export default function() {
	const namespace = location.protocol + '//' + location.host + '/css-hot-reload';
	const socket = io.connect( namespace );

	socket.on( 'css-hot-reload', function( data ) {
		switch ( data.status ) {
			case 'reload':
				// Turn HTMLCollection to standard list
				const elems = [].slice.call( document.head.getElementsByTagName( 'link' ) );
				elems.forEach( function( oldLink ) {
					if ( 'href' in oldLink && isChanged( oldLink.href, data.changedFiles ) ) {
						console.log( 'Reloading CSS: ', oldLink );
						// Remove old .css and insert new one in the same spot
						const newLink = document.createElement( 'link' );
						// Copy <link> standard attributes
						standardAttributes
							.filter( attr => oldLink.hasAttribute( attr ) )
							.map( attr => ( { name: attr, oldValue: oldLink.getAttribute( attr ) } ) )
							.map( bustHashForHrefs )
							.forEach( ( { name, value } ) => newLink.setAttribute( name, value ) );
						oldLink.parentNode.replaceChild( newLink, oldLink );
					}
				} );
				break;
			case 'building':
				console.log( 'Building CSS…' );
				break;
			case 'build-failed':
				console.error( 'CSS build failed.\n', data.error );
				break;
		}
	} );
}
