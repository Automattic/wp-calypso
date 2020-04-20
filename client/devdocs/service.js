/**
 * External dependencies
 */
import { stringify } from 'qs';

async function fetchDocsEndpoint( endpoint, params, callback ) {
	const queryParams = stringify( params );
	const query = queryParams === '' ? '' : `?${ queryParams }`;

	const res = await fetch( `/devdocs/service/${ endpoint }${ query }` );
	if ( ! res.ok ) {
		callback( `Error invoking /devdocs/${ endpoint }: ${ await res.text() }`, null );
		return;
	}

	const contentType = res.headers.get( 'content-type' );
	if ( contentType && contentType.includes( 'application/json' ) ) {
		callback( null, await res.json() );
	} else {
		callback( null, await res.text() );
	}
}

/**
 * This service allows you to retrieve a document list (with title, snippets and path) based on
 * query term or filename(s), and also to separately retrieve the document body by path.
 */
export default {
	search: function ( term, callback ) {
		fetchDocsEndpoint( 'search', { q: term }, callback );
	},

	list: function ( filenames, callback ) {
		fetchDocsEndpoint( 'list', { files: filenames.join( ',' ) }, callback );
	},

	fetch: function ( path, callback ) {
		fetchDocsEndpoint( 'content', { path: path }, callback );
	},
};
