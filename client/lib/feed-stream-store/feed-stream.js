/**
 * External Dependencies
 */
var assign = require( 'lodash/object/assign' ),
	debug = require( 'debug' )( 'calypso:feed-store:post-list-store' ),
	filter = require( 'lodash/collection/filter' ),
	forEach = require( 'lodash/collection/forEach' ),
	map = require( 'lodash/collection/map' ),
	moment = require( 'moment' ),
	noop = require( 'lodash/utility/noop' ),
	get = require( 'lodash/object/get' ),
	url = require( 'url' );

/**
 * Internal Dependencies
 */
var Dispatcher = require( 'dispatcher' ),
	Emitter = require( 'lib/mixins/emitter' ),
	FeedPostStore = require( 'lib/feed-post-store' ),
	FeedStreamActions = require( './actions' ),
	ActionTypes = require( './constants' ).action,
	PollerPool = require( 'lib/data-poller' ),
	FeedSubscriptionStore = require( 'lib/reader-feed-subscriptions' ),
	XPostHelper = require( 'reader/xpost-helper' );

var FeedStream = function( spec ) {
	if ( ! spec ) {
		throw new Error( 'must supply a feed stream spec' );
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
		postKeys: [], // an array of keys, as determined by the key maker,
		pendingPostKeys: [],
		postById: {},
		errors: [],
		fetcher: spec.fetcher,
		page: 1,
		perPage: 7,
		selectedIndex: -1,
		xPostedByURL: {},
		maxUpdates: 40,
		gapFillCount: 21,
		orderBy: 'date',
		_isLastPage: false,
		_isFetchingNextPage: false,
		keyMaker: spec.keyMaker,
		onNextPageFetch: spec.onNextPageFetch || noop,
		onGapFetch: spec.onGapFetch || noop,
		onUpdateFetch: spec.onUpdateFetch || noop,
		dateProperty: spec.dateProperty || 'date',
		poller: PollerPool.add( this, 'pollForUpdates', {
			interval: 60 * 1000,
			leading: false,
			pauseWhenHidden: false
		} )
	} );
};

assign( FeedStream.prototype, {

	destroy: function() {
		PollerPool.remove( this.poller );
	},

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
			case ActionTypes.RECEIVE_UPDATES:
				this.receiveUpdates( action.id, action.error, action.data );
				break;
			case ActionTypes.SHOW_UPDATES:
				this.acceptUpdates();
				break;
			case ActionTypes.RECEIVE_GAP:
				this.receiveFeedGap( action.gap, action.error, action.data );
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
			return key.isGap ? key : FeedPostStore.get( key );
		} );
	},

	getPage: function() {
		return this.page;
	},

	getPerPage: function() {
		return this.perPage;
	},

	getUpdateCount: function() {
		return this.pendingPostKeys.length;
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
		var post;
		if ( postKey.isGap === true ) {
			return true;
		}
		post = FeedPostStore.get( postKey );
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

	getLastItemWithDate: function() {
		var i, key, date;

		i = this.postKeys.length - 1;
		if ( i === -1 ) {
			return;
		}

		do {
			key = this.postKeys[ i ];
			if ( ! key.isGap ) {
				date = FeedPostStore.get( key )[ this.dateProperty ];
			}
			--i;
		} while ( ! date && i !== -1 );

		return date;
	},

	getFirstItemWithDate: function() {
		var i, key, date;

		if ( this.postKeys.length === 0 ) {
			return;
		}

		i = 0;

		do {
			key = this.postKeys[ i ];
			if ( ! key.isGap ) {
				date = FeedPostStore.get( key )[ this.dateProperty ];
			}
			++i;
		} while ( ! date && i < this.postKeys.length );

		return date;
	},

	hasRecentError: function() {
		var aMinuteAgo = Date.now() - ( 60 * 1000 );
		return this.errors.some( function( error ) {
			return error.timestamp && error.timestamp > aMinuteAgo;
		} );
	},

	setIsFetchingNextPage: function( val ) {
		this._isFetchingNextPage = val;
		this.emit( 'change' );
	},

	pollForUpdates: function() {
		if ( this.isFetchingUpdates ) {
			debug( 'already fetching, skip' );
			return;
		}

		if ( ! this.postKeys.length ) {
			debug( 'skipping poll because we have no posts' );
			return;
		}

		// most recent post
		let mostRecentDate = this.getFirstItemWithDate(),
			params;

		if ( ! mostRecentDate ) {
			return;
		}

		this.isFetchingUpdates = true;

		params = {
			orderBy: this.orderBy,
			number: this.maxUpdates,
			before: moment().toISOString(),
			after: mostRecentDate
		};

		this.onUpdateFetch( params );
		debug( 'polling for updates' );
		this.fetcher( params, function( error, data ) {
			debug( 'poll response received', error, data );
			this.isFetchingUpdates = false;
			FeedStreamActions.receiveUpdates( this.id, error, data );
		}.bind( this ) );
	},

	/**
	 * Returns a list of sites this url was cross posted to.
	 * @param {string} postURL - i.e.: https://developer.wordpress.com/blog/2015/10/08/this-is-just-to-say/
	 * @returns {array} - i.e. [ { siteURL: http://dailypost.wordpress.com/, siteName: "+dailypost" } ]
	 */
	getSitesCrossPostedTo: function( postURL ) {
		return this.xPostedByURL[ postURL ];
	},

	/**
	 * If possible, returns the post metadata from a given response.
	 * @param {object} postWrapper - response with post metadata
	 * @returns {*} - null or post object
	 * @private
	 */
	_getPostFromMetadata: function( postWrapper ) {
		if ( postWrapper && get( postWrapper, 'meta.data.discover_original_post' ) ) {
			return postWrapper.meta.data.discover_original_post;
		} else if ( postWrapper && get( postWrapper, 'meta.data.post' ) ) {
			return postWrapper.meta.data.post;
		} else if ( postWrapper.feed_ID || postWrapper.site_ID ) {
			return postWrapper;
		}
		return null;
	},

	_addXPost: function( postURL, xPostedBy ) {
		if ( this.xPostedByURL[ postURL ] ) {
			let sites = this.xPostedByURL[ postURL ];
			sites = sites.filter( function( site ) {
				return site.siteName !== xPostedBy.siteName && site.siteURL !== xPostedBy.siteURL;
			} );
			sites.push( xPostedBy );
			this.xPostedByURL[ postURL ] = sites;
		} else {
			this.xPostedByURL[ postURL ] = [ xPostedBy ];
		}
	},

	/**
	 * Given a list of responses with post metadata, attempts to roll up
	 * applicable x-posts. Has a side effect of updating this.xPostedByURL
	 * so we can keep track of where a post has been x-posted to.
	 * @param {array} posts - a list of posts
	 * @returns {array} posts - a filtered list of posts
	 */
	filterFollowedXPosts: function( posts ) {
		return posts.filter( ( postWrapper ) => {
			let post = this._getPostFromMetadata( postWrapper );
			//note that the post hasn't been normalized yet.
			if ( post && post.tags && post.tags[ 'p2-xpost' ] ) {
				let xPostMetadata = XPostHelper.getXPostMetadata( post );
				if ( ! xPostMetadata.postURL ) {
					// we don't have the information to render this x-post
					return false;
				}
				let isFollowing = FeedSubscriptionStore.getIsFollowingBySiteUrl( xPostMetadata.siteURL );
				// x-post sites are tagged with `+subdomain`
				let siteName = `+${url.parse( post.site_URL ).hostname.split( '.' )[ 0 ]}`;
				// keep track of where we cross-posted to, so we can add
				// this info to the original post.
				let xPostedBy = {
					siteURL: post.site_URL,
					siteName: siteName
				};
				this._addXPost( xPostMetadata.postURL, xPostedBy );
				// also keep track of origin comment urls, so we can roll up
				// multiple x-posts from a single origin comment.
				if ( xPostMetadata.commentURL ) {
					this._addXPost( xPostMetadata.commentURL, xPostedBy );
					return this.xPostedByURL[ xPostMetadata.commentURL ].length === 1;
				}
				if ( ! isFollowing ) {
					//only leave the topmost as a notice
					return this.xPostedByURL[ xPostMetadata.postURL ].length === 1;
				}
				return false;
			}
			return true;
		} );
	},

	filterNewPosts: function( posts ) {
		posts = filter( posts, function( post ) {
			return ! ( post.ID in this.postById );
		}, this );
		posts = this.filterFollowedXPosts( posts );
		return map( posts, this.keyMaker );
	},

	/**
	 * Process a new page of data and concatenate to the end of the list
	 **/
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
			forEach( postKeys, function( postKey ) {
				this.postById[ postKey.postId ] = true;
			}, this );
			this.postKeys = this.postKeys.concat( postKeys );
			this.page++;
			this.emit( 'change' );
		}
	},

	receiveUpdates: function( id, error, data ) {
		var postKeys;

		if ( id !== this.id ) {
			return;
		}

		if ( error ) {
			return;
		}

		// pull in the updates. might cause a gap.
		if ( data && data.posts ) {
			postKeys = this.filterNewPosts( data.posts );
			if ( postKeys.length > 0 ) {
				this.pendingPostKeys = postKeys;
				this.pendingDateAfter = moment( data.date_range.after );
				this.emit( 'change' );
			}
		}
	},

	acceptUpdates: function() {
		if ( this.pendingPostKeys.length === 0 ) {
			return;
		}

		forEach( this.pendingPostKeys, function( postKey ) {
			this.postById[ postKey.postId ] = true;
		}, this );

		const mostRecentPostDate = moment( FeedPostStore.get( this.postKeys[ 0 ] )[ this.dateProperty ] );

		if ( this.pendingDateAfter > mostRecentPostDate ) {
			this.pendingPostKeys.push( {
				isGap: true,
				from: mostRecentPostDate,
				to: this.pendingDateAfter
			} );
		}
		this.postKeys = this.pendingPostKeys.concat( this.postKeys );
		if ( this.selectedIndex > -1 ) {
			//we already scroll to top of content, so deselect so we don't
			//try to scroll down again.
			this.selectedIndex = -1;
		}
		this.pendingPostKeys = [];
		this.pendingDateAfter = null;
		this.emit( 'change' );
	},

	receiveFeedGap: function( gap, error, data ) {
		if ( error ) {
			this.errors.push( error );
			this.emit( 'change' );
			return;
		}

		const posts = data && data.posts;
		if ( ! posts ) {
			return;
		}

		// find the gap
		const indexOfGap = this.postKeys.indexOf( gap );
		if ( indexOfGap === -1 ) {
			// gap not found???
			debug( 'gap %o not found', gap );
			return;
		}

		const beforeGap = this.postKeys.slice( 0, indexOfGap ),
			afterGap = this.postKeys.slice( indexOfGap + 1 ),
			gapItems = this.filterNewPosts( posts ),
			afterGapDate = moment( FeedPostStore.get( afterGap[ 0 ] )[ this.dateProperty ] );

		if ( posts.length === this.gapFillCount ) {
			if ( moment( posts[ posts.length - 1 ][ this.dateProperty ] ) > afterGapDate ) {
				// we still might have a gap
				gapItems.push( {
					isGap: true,
					from: afterGapDate,
					to: moment( posts[ posts.length - 1 ][ this.dateProperty ] )
				} );
			}
		}

		this.postKeys = beforeGap.concat( gapItems, afterGap );

		this.emit( 'change' );
	}
} );

Emitter( FeedStream.prototype );

module.exports = FeedStream;
