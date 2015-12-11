/**
 * External dependencies
 */
import debugModule from 'debug';
import clone from 'lodash/lang/clone';
import assign from 'lodash/object/assign';
import transform from 'lodash/object/transform';
import difference from 'lodash/array/difference';
import last from 'lodash/array/last';
import max from 'lodash/collection/max';
import { EventEmitter } from 'events/';
import some from 'lodash/collection/some';

/**
 * Internal dependencies
 */
import Dispatcher from 'dispatcher';
import treeConvert from 'lib/tree-convert';
import PostsStore from './posts-store';
import PostListCacheStore from './post-list-cache-store';

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
		isFetchingUpdated: false
	};

	function queryPosts( options ) {
		let query = assign( {}, _defaultQuery, options );

		if ( query.siteID && typeof query.siteID === 'string' ) {
			query.siteID = query.siteID.replace( /::/g, '/' );
		}

		if ( query.status === 'draft,pending' ) {
			query.orderBy = 'modified';
		}

		let list = PostListCacheStore.get( query );

		if ( list ) {
			_activeList = list;
		} else {
			_activeList = {
				id: _nextId,
				postIds: [],
				errors: [],
				query: query,
				page: 0,
				isLastPage: false,
				isFetchingNextPage: false,
				isFetchingUpdated: false
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
	 **/
	function sort() {
		var key = _activeList.query.orderBy;

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
		const found = data && data.found;
		let posts;
		let postIds;

		if ( listId !== _activeList.id ) {
			return;
		}

		_activeList.isFetchingNextPage = false;

		if ( error ) {
			debug( 'Error fetching PostsList from api:', error );
			error.timestamp = Date.now();
			_activeList.errors.push( error );
			return;
		}

		if ( ! found ) {
			_activeList.isLastPage = true;
			return;
		}

		// if we got a next page handle, cache it for the next page
		_activeList.nextPageHandle = data.meta && data.meta.next_page;

		if ( ! _activeList.nextPageHandle ) {
			_activeList.isLastPage = true;
		}

		posts = data.posts;

		postIds = posts.map( function( post ) {
			return post.global_ID;
		} );

		if ( postIds.length ) {
			// did we actually find any new posts?
			postIds = difference( postIds, _activeList.postIds );
			if ( postIds.length ) {
				_activeList.postIds = _activeList.postIds.concat( postIds );
				_activeList.page++;
			}
		}
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
			sort( _activeList.postIds );
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
				params.modified_after = max( this.getAll(), function( post ) {
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
