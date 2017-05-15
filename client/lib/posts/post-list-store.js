/**
 * External dependencies
 */
import debugModule from 'debug';
import clone from 'lodash/clone';
import assign from 'lodash/assign';
import transform from 'lodash/transform';
import difference from 'lodash/difference';
import last from 'lodash/last';
import maxBy from 'lodash/maxBy';
import { EventEmitter } from 'events/';
import some from 'lodash/some';

/**
 * Internal dependencies
 */
import Dispatcher from 'dispatcher';
import treeConvert from 'lib/tree-convert';
import PostsStore from './posts-store';
import PostListCacheStore,
	{
		getCacheKey,
		getCanonicalList,
		setCanonicalList,
		deleteCanonicalList
	} from './post-list-cache-store';

/**
 * Module Variables
 */
const _defaultQuery = {
	siteID: false,
	type: 'post',
	status: 'publish',
	orderBy: 'date',
	order: 'DESC',
	author: false,
	search: false,
	perPage: 20
};

const debug = debugModule( 'calypso:posts-list' );

let _nextId = 0;

/**
 * Find deleted posts based on ommissions in a new page of results.
 * In some cases the new list may overlap with our stored list. And when
 * this happens we can find elements that should be removed if they don't
 * appear in the new post-list.
 *
 * @param  {array} currentList - stored list of PostIDs
 * @param  {array} newPosts    - new page of postIDs
 * @return {array}             - postIDs in currentList that should be deleted
 */
export function getRemovedPosts( currentList, newPosts ) {
	if ( currentList.length < 3 || newPosts.length < 2 ) {
		return [];
	}

	const overlapBegin = currentList.indexOf( newPosts[ 0 ] );
	if ( overlapBegin === -1 ) {
		return getRemovedPosts( currentList, newPosts.slice( 1 ) );
	}

	const overlapEnd = currentList.indexOf( newPosts.slice( -1 )[ 0 ] );
	if ( overlapEnd === -1 ) {
		return getRemovedPosts( currentList, newPosts.slice( 0, -1 ) );
	}

	const overlapList = currentList.slice( overlapBegin, ( overlapEnd + 1 ) );
	return difference( overlapList, newPosts );
}

export default function( id ) {
	if ( ! id ) {
		throw new Error( 'must supply a post-list-store id' );
	}

	let _activeList = {
		postIds: [],
		errors: [],
		query: clone( _defaultQuery ),
		page: 0,
		nextPageHandle: false,
		isLastPage: false,
		isFetchingNextPage: false,
		isFetchingUpdated: false,
	};

	function queryPosts( options ) {
		let query = assign( {}, _defaultQuery, options );

		if ( query.siteID && typeof query.siteID === 'string' ) {
			query.siteID = query.siteID.replace( /::/g, '/' );
		}

		if ( query.status === 'draft,pending' ) {
			query.orderBy = 'modified';
		}

		const listKey = getCacheKey( query );
		let list = PostListCacheStore.get( listKey );

		if ( list ) {
			_activeList = list;
		} else {
			_activeList = {
				id: _nextId,
				postIds: [],
				errors: [],
				page: 0,
				isLastPage: false,
				isFetchingNextPage: false,
				isFetchingUpdated: false,
				query,
				listKey,
			};
			_nextId++;
		}
	}

	/**
	 * Remove any keys from the params that are null or undefined
	 *
	 * We do this to avoid sending empty values along.
	 * Returns a new object representing the clean params.
	 * The original params is unmodified.
	 *
	 * @param  {string} params The params to clean
	 * @return {object} The cleaned params object.
	 */
	function cleanParams( params ) {
		return transform( params, function( result, value, key ) {
			if ( value != null ) {
				result[ key ] = value;
			}
		}, {} );
	}

	/**
	 * Sort the active list
	 */
	function sort() {
		const key = _activeList.query.orderBy;

		_activeList.postIds.sort( function( a, b ) {
			var postA = PostsStore.get( a ),
				postB = PostsStore.get( b ),
				timeA = postA[ key ],
				timeB = postB[ key ];

			if ( timeA === timeB ) {
				if ( postA.title === postB.title ) {
					return 0;
				}

				return postA.title > postB.title ? 1 : -1;
			}
			// reverse-chronological
			return timeA > timeB ? -1 : 1;
		} );
	}

	// Process a new page of data and concatenate to the end of the list
	function receivePage( listId, error, data ) {
		if ( error || ! data || typeof data !== 'object' ) {
			error = error || { message: 'Error fetching PostsList: empty data response' };
			debug( 'Error fetching PostsList from api:', error );
			error.timestamp = Date.now();
			_activeList.errors.push( error );
			return;
		}
		const { found, meta, posts, __sync } = data;
		const { responseSource, requestKey } = __sync || {};

		if ( listId !== _activeList.id ) {
			return;
		}

		_activeList.isFetchingNextPage = false;

		// if we got a next page handle, cache it for the next page
		_activeList.nextPageHandle = meta && meta.next_page;

		if ( ! _activeList.nextPageHandle || ! found ) {
			_activeList.isLastPage = true;
		}

		const responsePostIDs = posts.map( function( post ) {
			return post.global_ID;
		} );

		let priorList = _activeList.postIds.slice( 0 );

		if ( responseSource === 'local' && requestKey ) {
			// store canonicalList before applying localResponse
			// so we can apply the serverResponse to the original
			// canonicalList
			setCanonicalList( _activeList.listKey, requestKey, priorList );
		} else {
			// use canonicalList to process server response
			const canonicalList = getCanonicalList( _activeList.listKey, requestKey );
			if ( canonicalList ) {
				debug( 'canonicalList found (%o)', canonicalList );
				priorList = canonicalList;
				deleteCanonicalList( _activeList.listKey, requestKey );
			}
		}

		// were some posts missing from the response?
		const removedPosts = getRemovedPosts( priorList, responsePostIDs );
		if ( removedPosts.length ) {
			debug( 'removePosts (%o)', removedPosts );
			priorList = difference( priorList, removedPosts );
		}

		// did we find any new posts?
		const newPosts = difference( responsePostIDs, priorList );
		if ( newPosts.length ) {
			debug( 'newPosts (%o)', newPosts );
			priorList = priorList.concat( newPosts );
			_activeList.page++;
		}
		_activeList.postIds = priorList;
		sort();
	}

	// Merge updated posts
	function receiveUpdates( listId, error, data ) {
		let posts;
		let postIds;
		let newPostIds;

		if ( error ) {
			debug( 'An error occurred while fetching updated posts %o', error );
			return;
		}

		if ( listId !== _activeList.id ) {
			return;
		}

		if ( ! data.posts.length ) {
			return;
		}

		posts = data.posts;

		debug( 'Fetched updated posts:', posts );

		postIds = posts.map( function( post ) {
			return post.global_ID;
		} );

		newPostIds = difference( postIds, _activeList.postIds );

		if ( newPostIds.length ) {
			_activeList.postIds = _activeList.postIds.concat( newPostIds );
			sort();
		}
	}

	return new class extends EventEmitter {
		constructor() {
			super();
			this.id = id;
			this.dispatchToken = Dispatcher.register( this.handlePayload.bind( this ) );
		}

		get() {
			return _activeList;
		}

		getID() {
			return _activeList.id;
		}

		getSiteID() {
			return _activeList.query.siteID;
		}

		// Get list of posts from current object
		getAll() {
			return _activeList.postIds.map( function( globalID ) {
				return PostsStore.get( globalID );
			} );
		}

		getTree() {
			const sortedPosts = [];

			// clone objects to prevent mutating store data, set parent to number
			_activeList.postIds.forEach( function( globalID ) {
				let post = clone( PostsStore.get( globalID ) );
				post.parent = post.parent ? post.parent.ID : 0;
				sortedPosts.push( post );
			} );

			return treeConvert( 'ID' ).treeify( sortedPosts );
		}

		getPost( globalID ) {
			if ( _activeList.postIds.indexOf( globalID ) > -1 ) {
				return PostsStore.get( globalID );
			}
		}

		getPage() {
			return _activeList.page;
		}

		off( event, method ) {
			this.removeListener( event, method );
		}

		isLastPage() {
			return _activeList.isLastPage;
		}

		isFetchingNextPage() {
			return _activeList.isFetchingNextPage;
		}

		// Have we received an error recently?
		hasRecentError() {
			const recentTimeIntervalSeconds = 30;
			const dateNow = Date.now();

			return some( _activeList.errors, function( error ) {
				return ( dateNow - error.timestamp ) < ( recentTimeIntervalSeconds * 1000 );
			} );
		}

		getNextPageParams() {
			let params = {};
			const query = _activeList.query;

			params.status = query.status;
			params.order_by = query.orderBy;
			params.order = query.order;
			params.author = query.author;
			params.number = query.perPage;
			params.type = query.type;
			params.page_handle = _activeList.nextPageHandle;
			params.exclude_tree = query.exclude_tree;
			params.number = query.number;
			params.before = query.before;
			params.after = query.after;

			if ( query.search ) {
				params.search = query.search;
			}

			if ( ! params.siteID ) {
				// Only query from visible sites
				params.site_visibility = 'visible';
			}

			if ( query.meta ) {
				params.meta = query.meta;
			}

			return cleanParams( params );
		}

		getUpdatesParams() {
			let params = {};
			const query = _activeList.query;

			params.status = query.status;
			params.author = query.author;
			params.type = query.type;

			if ( query.search ) {
				params.search = query.search;
			}

			if ( ! params.siteID ) {
				// Only query from visible sites
				params.site_visibility = 'visible';
			}

			if ( query.meta ) {
				params.meta = query.meta;
			}

			if ( _activeList.postIds.length ) {
				params.modified_after = maxBy( this.getAll(), function( post ) {
					return new Date( post.modified ).getTime();
				} ).modified;

				// For situations where the list ordered by publish date, we want to
				// only get updates that should show up in the list to avoid creating
				// a gap in our paging
				if ( query.orderBy !== 'modified' && ! _activeList.isLastPage ) {
					params.after = this.getPost( last( _activeList.postIds ) ).date;
				}
			}

			return cleanParams( params );
		}

		handlePayload( payload ) {
			const action = payload.action;

			// If this action does not match this post-list-store.id return, but always evaluate RECEIVE_UPDATED_POST regardless
			if ( ( action.postListStoreId && action.postListStoreId !== this.id ) &&
					'RECEIVE_UPDATED_POST' !== action.type
			) {
				return;
			}

			Dispatcher.waitFor( [ PostsStore.dispatchToken ] );

			switch ( action.type ) {
				case 'QUERY_POSTS':
					debug( 'QUERY_POSTS', action );
					queryPosts( action.options );
					this.emit( 'change' );
					break;
				case 'FETCH_NEXT_POSTS_PAGE':
					debug( 'FETCH_NEXT_POSTS_PAGE', action );
					_activeList.isFetchingNextPage = true;
					this.emit( 'change' );
					break;
				case 'RECEIVE_POSTS_PAGE':
					debug( 'receivePage', action );
					receivePage( action.id, action.error, action.data );
					this.emit( 'change' );
					break;

				case 'RECEIVE_UPDATED_POSTS':
					receiveUpdates( action.id, action.error, action.data );
					this.emit( 'change' );
					break;

				case 'RECEIVE_UPDATED_POST':
					if ( action.post ) {
						if ( _activeList.postIds.indexOf( action.post.global_ID ) > -1 ) {
							this.emit( 'change' );
						}
					}
					break;
			}
		}
	}();
};
