/**
 * External Dependencies
 */
var assign = require( 'lodash/assign' ),
	debug = require( 'debug' )( 'calypso:feed-store:post-list-store' ),
	filter = require( 'lodash/filter' ),
	forEach = require( 'lodash/forEach' ),
	map = require( 'lodash/map' );

/**
 * Internal Dependencies
 */
var Dispatcher = require( 'dispatcher' ),
	Emitter = require( 'lib/mixins/emitter' ),
	FeedPostStore = require( 'lib/feed-post-store' ),
	ActionTypes = require( './constants' ).action;

var PagedStream = function( spec ) {
	if ( ! spec ) {
		throw new Error( 'must supply a paged stream spec' );
	}

	if ( ! spec.id ) {
		throw new Error( 'missing id' );
	}

	if ( ! spec.fetcher ) {
		throw new Error( 'missing fetcher' );
	}

	if ( ! spec.keyMaker ) {
		throw new Error( 'must supply keyMaker' );
	}

	this.id = spec.id;

	assign( this, {
		id: spec.id,
		postKeys: [], // an array of keys, as determined by the key maker,
		pendingPostKeys: [],
		postById: {},
		errors: [],
		fetcher: spec.fetcher,
		page: 1,
		perPage: spec.perPage || 10,
		query: spec.query,
		selectedIndex: -1,
		orderBy: 'date',
		_isLastPage: false,
		_isFetchingNextPage: false,
		keyMaker: spec.keyMaker
	} );
};

assign( PagedStream.prototype, {

	handlePayload: function( payload ) {
		var action = payload && payload.action;

		if ( ! action ) {
			return;
		}

		if ( action.id !== this.id ) {
			return;
		}

		Dispatcher.waitFor( [ FeedPostStore.dispatchToken ] );

		switch ( action.type ) {

			case ActionTypes.RECEIVE_PAGE:
				this.receivePage( action.id, action.error, action.data );
				break;
			case ActionTypes.FETCH_NEXT_PAGE:
				this.setIsFetchingNextPage( true );
				break;
			case ActionTypes.SELECT_ITEM:
				this.selectItem( action.selectedIndex );
				break;
			case ActionTypes.SELECT_NEXT_ITEM:
				this.selectNextItem( action.selectedIndex );
				break;
			case ActionTypes.SELECT_PREV_ITEM:
				this.selectPrevItem( action.selectedIndex );
				break;
			case ActionTypes.CHANGE_QUERY:
				this.resetQuery( action.query );
				break;
		}
	},

	get: function() {
		return this.postKeys;
	},

	getID: function() {
		return this.id;
	},

	getAll: function() {
		return map( this.postKeys, function( key ) {
			return FeedPostStore.get( key );
		} );
	},

	getPage: function() {
		return this.page;
	},

	getPerPage: function() {
		return this.perPage;
	},

	getUpdateCount: function() {
		return 0;
	},

	getSelectedPost: function() {
		if ( this.selectedIndex >= 0 && this.selectedIndex < this.postKeys.length ) {
			return this.postKeys[ this.selectedIndex ];
		}
		return null;
	},

	getSelectedIndex: function() {
		return this.selectedIndex;
	},

	isLastPage: function() {
		return this._isLastPage;
	},

	isFetchingNextPage: function() {
		return this._isFetchingNextPage;
	},

	_isValidPostOrGap: function( postKey ) {
		var post = FeedPostStore.get( postKey );
		return post && post._state !== 'error' && post._state !== 'pending' &&
			post._state !== 'minimal';
	},

	selectNextItem: function( selectedIndex ) {
		var nextIndex = selectedIndex + 1;
		if ( nextIndex > -1 && nextIndex < this.postKeys.length ) {
			if ( this._isValidPostOrGap( this.postKeys[ nextIndex ] ) ) {
				this.selectedIndex = nextIndex;
				this.emit( 'change' );
			} else {
				this.selectNextItem( nextIndex );
			}
		}
	},

	selectPrevItem: function( selectedIndex ) {
		var nextIndex = selectedIndex - 1;
		if ( nextIndex > -1 && nextIndex < this.postKeys.length ) {
			if ( this._isValidPostOrGap( this.postKeys[ nextIndex ] ) ) {
				this.selectedIndex = nextIndex;
				this.emit( 'change' );
			} else {
				this.selectPrevItem( nextIndex );
			}
		}
	},

	selectItem: function( selectedIndex ) {
		this.selectNextItem( selectedIndex - 1 );
	},

	onNextPageFetch: function( params ) {
		params.offset = ( this.page - 1 ) * this.perPage;
		params.before = this.startDate || undefined;
		params.after = undefined;
		params.number = this.perPage;
	},

	getLastItemWithDate: function() {
		return null;
	},

	getFirstItemWithDate: function() {
		return null;
	},

	hasRecentError: function( errorType ) {
		var aMinuteAgo = Date.now() - ( 60 * 1000 );
		return this.errors.some( function( error ) {
			return ( error.timestamp && error.timestamp > aMinuteAgo ) && ( ! errorType || errorType === error.error );
		} );
	},

	setIsFetchingNextPage: function( val ) {
		this._isFetchingNextPage = val;
		this.emit( 'change' );
	},

	filterNewPosts: function( posts ) {
		const postById = this.postById;
		posts = filter( posts, function( post ) {
			return ! ( post.ID in postById );
		} );
		return map( posts, this.keyMaker );
	},

	getSitesCrossPostedTo: function() {
		return null;
	},

	receivePage: function( id, error, data ) {
		var posts, postKeys;

		if ( id !== this.id ) {
			return;
		}

		debug( 'receiving page in %s', this.id );

		this._isFetchingNextPage = false;

		if ( error ) {
			debug( 'Error fetching posts from API:', error );
			error.timestamp = Date.now();
			this.errors.push( error );
			this.emit( 'change' );
			return;
		}

		posts = data && data.posts;

		if ( ! posts ) {
			return;
		}

		if ( ! posts.length ) {
			this._isLastPage = true;
			this.emit( 'change' );
			return;
		}

		postKeys = this.filterNewPosts( posts );

		if ( postKeys.length ) {
			const postById = this.postById;
			forEach( postKeys, function( postKey ) {
				postById[ postKey.postId ] = true;
			} );
			this.postKeys = this.postKeys.concat( postKeys );
			this.page++;
			this.emit( 'change' );
		}
	}
} );

Emitter( PagedStream.prototype );

module.exports = PagedStream;
