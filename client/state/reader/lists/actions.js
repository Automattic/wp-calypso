/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	READER_LIST_DISMISS_NOTICE,
	READER_LIST_REQUEST,
	READER_LIST_REQUEST_SUCCESS,
	READER_LIST_REQUEST_FAILURE,
	READER_LIST_UPDATE,
	READER_LIST_UPDATE_SUCCESS,
	READER_LIST_UPDATE_FAILURE,
	READER_LIST_UPDATE_TITLE,
	READER_LIST_UPDATE_DESCRIPTION,
	READER_LISTS_RECEIVE,
	READER_LISTS_REQUEST,
	READER_LISTS_REQUEST_SUCCESS,
	READER_LISTS_REQUEST_FAILURE,
	READER_LISTS_FOLLOW,
	READER_LISTS_FOLLOW_SUCCESS,
	READER_LISTS_FOLLOW_FAILURE,
	READER_LISTS_UNFOLLOW,
	READER_LISTS_UNFOLLOW_SUCCESS,
	READER_LISTS_UNFOLLOW_FAILURE,
} from 'state/reader/action-types';

import 'state/reader/init';

/**
 * Returns an action object to signal that list objects have been received.
 *
 * @param  {Array}  lists Lists received
 * @returns {object}       Action object
 */
export function receiveLists( lists ) {
	return {
		type: READER_LISTS_RECEIVE,
		lists,
	};
}

/**
 * Triggers a network request to fetch the current user's lists.
 *
 * @returns {Function}        Action thunk
 */
export function requestSubscribedLists() {
	return ( dispatch ) => {
		dispatch( {
			type: READER_LISTS_REQUEST,
		} );

		return new Promise( ( resolve, reject ) => {
			wpcom.undocumented().readLists( ( error, data ) => {
				error ? reject( error ) : resolve( data );
			} );
		} )
			.then( ( data ) => {
				dispatch( receiveLists( data.lists ) );
				dispatch( {
					type: READER_LISTS_REQUEST_SUCCESS,
					data,
				} );
			} )
			.catch( ( error ) => {
				dispatch( {
					type: READER_LISTS_REQUEST_FAILURE,
					error,
				} );
			} );
	};
}

/**
 * Triggers a network request to fetch a single Reader list.
 *
 * @param  {string}  owner List owner
 * @param  {string}  slug List slug
 * @returns {Function}        Action thunk
 */
export function requestList( owner, slug ) {
	return ( dispatch ) => {
		dispatch( {
			type: READER_LIST_REQUEST,
		} );

		const query = createQuery( owner, slug );

		return new Promise( ( resolve, reject ) => {
			wpcom.undocumented().readList( query, ( error, data ) => {
				if ( error ) {
					const errorInfo = {
						error,
						owner,
						slug,
					};
					reject( errorInfo );
				} else {
					resolve( data );
				}
			} );
		} )
			.then( ( data ) => {
				dispatch( {
					type: READER_LIST_REQUEST_SUCCESS,
					data,
				} );
			} )
			.catch( ( errorInfo ) => {
				dispatch( {
					type: READER_LIST_REQUEST_FAILURE,
					error: errorInfo.error,
					owner: errorInfo.owner,
					slug: errorInfo.slug,
				} );
			} );
	};
}

/**
 * Triggers a network request to follow a list.
 *
 * @param  {string}  owner List owner
 * @param  {string}  slug List slug
 * @returns {Function} Action promise
 */
export function followList( owner, slug ) {
	return ( dispatch ) => {
		dispatch( {
			type: READER_LISTS_FOLLOW,
			owner,
			slug,
		} );

		const query = createQuery( owner, slug );

		return new Promise( ( resolve, reject ) => {
			wpcom.undocumented().followList( query, ( error, data ) => {
				error ? reject( error ) : resolve( data );
			} );
		} )
			.then( ( data ) => {
				dispatch( {
					type: READER_LISTS_FOLLOW_SUCCESS,
					data,
				} );
			} )
			.catch( ( error ) => {
				dispatch( {
					type: READER_LISTS_FOLLOW_FAILURE,
					error,
				} );
			} );
	};
}

/**
 * Triggers a network request to unfollow a list.
 *
 * @param  {string}  owner List owner
 * @param  {string}  slug List slug
 * @returns {Function} Action promise
 */
export function unfollowList( owner, slug ) {
	return ( dispatch ) => {
		dispatch( {
			type: READER_LISTS_UNFOLLOW,
			owner,
			slug,
		} );

		const query = createQuery( owner, slug );

		return new Promise( ( resolve, reject ) => {
			wpcom.undocumented().unfollowList( query, ( error, data ) => {
				error ? reject( error ) : resolve( data );
			} );
		} )
			.then( ( data ) => {
				dispatch( {
					type: READER_LISTS_UNFOLLOW_SUCCESS,
					data,
				} );
			} )
			.catch( ( error ) => {
				dispatch( {
					type: READER_LISTS_UNFOLLOW_FAILURE,
					error,
				} );
			} );
	};
}

/**
 * Triggers a network request to update a list's details.
 *
 * @param  {object}  list List details to save
 * @returns {Function} Action promise
 */
export function updateListDetails( list ) {
	if ( ! list || ! list.owner || ! list.slug || ! list.title ) {
		throw new Error( 'List owner, slug and title are required' );
	}

	const preparedOwner = decodeURIComponent( list.owner );
	const preparedSlug = decodeURIComponent( list.slug );
	const preparedList = Object.assign( {}, list, { owner: preparedOwner, slug: preparedSlug } );

	return ( dispatch ) => {
		dispatch( {
			type: READER_LIST_UPDATE,
			list,
		} );

		return new Promise( ( resolve, reject ) => {
			wpcom.undocumented().readListsUpdate( preparedList, ( error, data ) => {
				if ( error ) {
					dispatch( {
						type: READER_LIST_UPDATE_FAILURE,
						list,
						error,
					} );
					reject( error );
				} else {
					dispatch( {
						type: READER_LIST_UPDATE_SUCCESS,
						list,
						data,
					} );
					resolve();
				}
			} );
		} );
	};
}

/**
 * Trigger an action to dismiss a list update notice.
 *
 * @param  {number}  listId List ID
 * @returns {Function} Action thunk
 */
export function dismissListNotice( listId ) {
	return ( dispatch ) => {
		dispatch( {
			type: READER_LIST_DISMISS_NOTICE,
			listId,
		} );
	};
}

/**
 * Trigger an action to update a list title.
 *
 * @param  {number}  listId List ID
 * @param  {string}  newTitle List title
 * @returns {Function} Action thunk
 */
export function updateTitle( listId, newTitle ) {
	return ( dispatch ) => {
		dispatch( {
			type: READER_LIST_UPDATE_TITLE,
			listId,
			title: newTitle,
		} );
	};
}

/**
 * Trigger an action to update a list description.
 *
 * @param  {number}  listId List ID
 * @param  {string}  newDescription List description
 * @returns {Function} Action thunk
 */
export function updateDescription( listId, newDescription ) {
	return ( dispatch ) => {
		dispatch( {
			type: READER_LIST_UPDATE_DESCRIPTION,
			listId,
			description: newDescription,
		} );
	};
}

function createQuery( owner, slug ) {
	const preparedOwner = decodeURIComponent( owner );
	const preparedSlug = decodeURIComponent( slug );
	return { owner: preparedOwner, slug: preparedSlug };
}
