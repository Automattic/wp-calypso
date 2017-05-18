/**
  * Internal dependencies
  */
import wp from 'lib/wp';

// TODO: Use the new data-layer instead

const _request = ( func, path, siteId, body = {} ) => {
	return func( { path: `/jetpack-blogs/${ siteId }/rest-api/` }, { path: '/wc/v2/' + path, ...body } )
			.then( ( { data } ) => data );
};

const addParam = ( url, param ) => url + ( -1 !== url.indexOf( '?' ) ? '?' : '&' ) + param;

export default ( siteId ) => ( {
	get: ( path ) => _request( wp.req.get, path, siteId ),

	post: ( path, body ) => _request( wp.req.post, path, siteId, body ),

	put: ( path, body ) => _request( wp.req.post, addParam( path, '_method=put' ), siteId, body ),

	del: ( path ) => _request( wp.req.post, addParam( path, '_method=delete' ), siteId ),
} );
