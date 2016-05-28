/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	POST_TYPES_TAXONOMIES_RECEIVE,
	POST_TYPES_TAXONOMIES_REQUEST,
	POST_TYPES_TAXONOMIES_REQUEST_FAILURE,
	POST_TYPES_TAXONOMIES_REQUEST_SUCCESS
} from 'state/action-types';

/**
 * Returns an action object to be used in signalling that post type taxonomies
 * for a site have been received.
 *
 * @param  {Number} siteId     Site ID
 * @param  {String} postType   Post type
 * @param  {Array}  taxonomies Taxonomies received
 * @return {Object}            Action object
 */
export function receivePostTypeTaxonomies( siteId, postType, taxonomies ) {
	return {
		type: POST_TYPES_TAXONOMIES_RECEIVE,
		siteId,
		postType,
		taxonomies
	};
}

/**
 * Returns an action thunk which, when invoked, triggers a network request to
 * retrieve post type taxonomies for a site.
 *
 * @param  {Number}   siteId   Site ID
 * @param  {String}   postType Post type
 * @return {Function}          Action thunk
 */
export function requestPostTypeTaxonomies( siteId, postType ) {
	return ( dispatch ) => {
		dispatch( {
			type: POST_TYPES_TAXONOMIES_REQUEST,
			siteId,
			postType
		} );

		return wpcom
			.withLocale()
			.site( siteId )
			.postType( postType )
			.taxonomiesList()
			.then( ( { taxonomies } ) => {
				dispatch( receivePostTypeTaxonomies( siteId, postType, taxonomies ) );
				dispatch( {
					type: POST_TYPES_TAXONOMIES_REQUEST_SUCCESS,
					siteId,
					postType
				} );
			} )
			.catch( ( error ) => {
				dispatch( {
					type: POST_TYPES_TAXONOMIES_REQUEST_FAILURE,
					siteId,
					postType,
					error
				} );
			} );
	};
}
