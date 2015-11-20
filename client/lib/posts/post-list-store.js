/**
 * External dependencies
 */
var debug = require( 'debug' )( 'calypso:posts-list' ),
	clone = require( 'lodash/lang/clone' ),
	assign = require( 'lodash/object/assign' ),
	transform = require( 'lodash/object/transform' ),
	difference = require( 'lodash/array/difference' ),
	last = require( 'lodash/array/last' ),
	max = require( 'lodash/collection/max' );

/**
 * Internal dependencies
 */
var Emitter = require( 'lib/mixins/emitter' ),
	Dispatcher = require( 'dispatcher' ),
	treeConvert = require( 'lib/tree-convert' )( 'ID' ),
	PostsStore = require( './posts-store' );

var _defaultQuery = {
	siteID: false,
	type: 'post',
	status: 'publish',
	orderBy: 'date',
	order: 'DESC',
	author: false,
	search: false,
	perPage: 20
};

var _activeList = {
	postIds: [],
	errors: [],
	query: clone( _defaultQuery ),
	page: 0,
	nextPageHandle: false,
	isLastPage: false,
	isFetchingNextPage: false,
	isFetchingUpdated: false
};

var _nextId = 0;
var PostListStore;

function queryPosts( options ) {
	var query = assign( {}, _defaultQuery, options ),
		cache = require( './post-list-cache-store' ),
		list;

	if ( query.siteID && typeof query.siteID === 'string' ) {
		query.siteID = query.siteID.replace( /::/g, '/' );
	}

	if ( query.status === 'draft,pending' ) {
		query.orderBy = 'modified';
	}

	list = cache.get( query );

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

	PostListStore.emit( 'change' );
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
			} else {
				return postA.title > postB.title ? 1 : -1;
			}
		}
		// reverse-chronological
		return timeA > timeB ? -1 : 1;
	} );
}

/**
 * Process a new page of data and concatenate to the end of the list
 **/
function receivePage( id, error, data ) {
	var found = data && data.found,
		posts,
		postIds;

	if ( id !== _activeList.id ) {
		return;
	}

	_activeList.isFetchingNextPage = false;

	if ( error ) {
		debug( 'Error fetching PostsList from api:', error );
		_activeList.errors.push( error );
		PostListStore.emit( 'change' );
		return;
	}

	if ( ! found ) {
		_activeList.isLastPage = true;
		PostListStore.emit( 'change' );
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

	PostListStore.emit( 'change' );
}

/**
 * Merge updated posts
 **/
function receiveUpdates( id, error, data ) {
	var posts, postIds, newPostIds;

	if ( error ) {
		debug( 'An error occurred while fetching updated posts %o', error );
		return;
	}

	if ( id !== _activeList.id ) {
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

	PostListStore.emit( 'change' );
}

PostListStore = {

	get: function() {
		return _activeList;
	},

	getID: function() {
		return _activeList.id;
	},

	getSiteID: function() {
		return _activeList.query.siteID;
	},

	/**
	* Get list of posts from current object
	*/
	getAll: function() {
		return _activeList.postIds.map( function( globalID ) {
			return PostsStore.get( globalID );
		} );
	},

	getTree: function() {
		var sortedPosts = [];

		// clone objects to prevent mutating store data, set parent to number
		_activeList.postIds.forEach( function( globalID ) {
			var post = clone( PostsStore.get( globalID ) );
			post.parent = post.parent ? post.parent.ID : 0;
			sortedPosts.push( post );
		} );

		return treeConvert.treeify( sortedPosts );
	},

	getPost: function( globalID ) {
		if ( _activeList.postIds.indexOf( globalID ) > -1 ) {
			return PostsStore.get( globalID );
		}
	},

	getPage: function() {
		return _activeList.page;
	},

	isLastPage: function() {
		return _activeList.isLastPage;
	},

	isFetchingNextPage: function() {
		return _activeList.isFetchingNextPage;
	},

	getNextPageParams: function() {
		var params = {},
			query = _activeList.query;

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
	},

	getUpdatesParams: function() {
		var params = {},
			query = _activeList.query;

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
			params.modified_after = max( PostListStore.getAll(), function( post ) {
				return new Date( post.modified ).getTime();
			} ).modified;

			// For situations where the list ordered by publish date, we want to
			// only get updates that should show up in the list to avoid creating
			// a gap in our paging
			if ( query.orderBy !== 'modified' && ! _activeList.isLastPage ) {
				params.after = PostListStore.getPost( last( _activeList.postIds ) ).date;
			}
		}

		return cleanParams( params );
	}

};

Emitter( PostListStore );

PostListStore.dispatchToken = Dispatcher.register( function( payload ) {
	var action = payload.action;

	Dispatcher.waitFor( [ PostsStore.dispatchToken ] );

	switch( action.type ) {
		case 'QUERY_POSTS':
			queryPosts( action.options );
			break;
		case 'FETCH_NEXT_POSTS_PAGE':
			_activeList.isFetchingNextPage = true;
			PostListStore.emit( 'change' );
			break;
		case 'RECEIVE_POSTS_PAGE':
			receivePage( action.id, action.error, action.data );
			break;

		case 'RECEIVE_UPDATED_POSTS':
			receiveUpdates( action.id, action.error, action.data );
			break;

		case 'RECEIVE_UPDATED_POST':
			if ( action.post ) {
				if ( _activeList.postIds.indexOf( action.post.global_ID ) > -1 ) {
					PostListStore.emit( 'change' );
				}
			}
			break;

	}

} );

module.exports = PostListStore;
