/** @format */
/**
 * External Dependencies
 */
import {
	filter,
	findIndex,
	findLastIndex,
	forEach,
	get,
	map,
	noop,
	some,
	defer,
	uniqBy,
} from 'lodash';
import moment from 'moment';
import debugFactory from 'debug';

/**
 * Internal Dependencies
 */
import Emitter from 'lib/mixins/emitter';
import * as FeedStreamActions from './actions';
import { action as ActionTypes } from './constants';
import PollerPool from 'lib/data-poller';
import * as stats from 'reader/stats';
import { keyToString, keysAreEqual } from 'reader/post-key';
import { reduxDispatch, reduxGetState } from 'lib/redux-bridge';
import { COMMENTS_RECEIVE } from 'state/action-types';
import { getPostByKey } from 'state/reader/posts/selectors';

const debug = debugFactory( 'calypso:feed-store:post-list-store' );

const postKeyToString = postKey => `${ postKey.blogId }-${ postKey.postId }`;

export default class FeedStream {
	constructor( spec ) {
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

		Object.assign( this, {
			id: spec.id,
			postKeys: [], // an array of keys, as determined by the key maker,
			pendingPostKeys: [],
			pendingComments: new Map(),
			postById: new Set(),
			errors: [],
			fetcher: spec.fetcher,
			page: 1,
			perPage: 7,
			selectedIndex: -1,
			xPostedByURL: {},
			maxUpdates: spec.maxUpdates || 40,
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
				pauseWhenHidden: false,
			} ),
			startDate: spec.startDate,
		} );
	}

	destroy() {
		PollerPool.remove( this.poller );
	}

	handlePayload( payload ) {
		const action = payload && payload.action;

		if ( ! action ) {
			return;
		}

		if ( action.id !== this.id ) {
			return;
		}

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
				this.selectItem( action.postKey, action.id );
				break;
			case ActionTypes.SELECT_NEXT_ITEM:
				this.selectNextItem( action.postKey );
				break;
			case ActionTypes.SELECT_PREV_ITEM:
				this.selectPrevItem( action.postKey );
				break;
			case ActionTypes.SELECT_FIRST_ITEM:
				this.selectFirstItem();
				break;
		}
	}

	get() {
		return this.postKeys;
	}

	getID() {
		return this.id;
	}

	getAll() {
		return map( this.postKeys, function( key ) {
			return key.isGap ? key : getPostByKey( reduxGetState(), key );
		} );
	}

	getPage() {
		return this.page;
	}

	getPerPage() {
		return this.perPage;
	}

	getUpdateCount() {
		return this.pendingPostKeys.length;
	}

	getPendingPostKeys() {
		return this.pendingPostKeys;
	}

	getSelectedPostKey() {
		if ( this.selectedIndex >= 0 && this.selectedIndex < this.postKeys.length ) {
			return this.postKeys[ this.selectedIndex ];
		}
		return null;
	}

	isLastPage() {
		return this._isLastPage;
	}

	isFetchingNextPage() {
		return this._isFetchingNextPage;
	}

	isValidPostOrGap( postKey ) {
		if ( postKey.isGap === true ) {
			return true;
		}
		const post = getPostByKey( reduxGetState(), postKey );
		return (
			post && post._state !== 'error' && post._state !== 'pending' && post._state !== 'minimal'
		);
	}

	selectNextItem() {
		if ( this.selectedIndex === -1 ) {
			return;
		}
		const nextIndex = findIndex( this.postKeys, this.isValidPostOrGap, this.selectedIndex + 1 );
		if ( nextIndex !== -1 ) {
			this.selectedIndex = nextIndex;
			this.emitChange();
		}

		const PREFETCH_THRESHOLD = 10;
		// If we are getting close to the end of the loaded stream, or are already at the end,
		// start fetching new posts
		if ( nextIndex + PREFETCH_THRESHOLD > this.postKeys.length || nextIndex === -1 ) {
			const fetchNextPage = () => FeedStreamActions.fetchNextPage( this.getID() );
			defer( fetchNextPage );
			this.onKeyboardFetchPerformed();
		}
	}

	onKeyboardFetchPerformed() {
		stats.recordTrack( 'calypso_reader_fullpost_keyboard_fetch' );
	}

	selectPrevItem() {
		if ( this.selectedIndex < 1 ) {
			// this also captures a selectedIndex of 0, and that's intentional
			return;
		}
		const prevIndex = findLastIndex( this.postKeys, this.isValidPostOrGap, this.selectedIndex - 1 );
		if ( prevIndex !== -1 ) {
			this.selectedIndex = prevIndex;
			this.emitChange();
		}
	}

	selectFirstItem() {
		if ( this.selectedIndex !== 0 ) {
			this.selectedIndex = 0;
			this.emitChange();
		}
	}

	selectItem( postKey, id ) {
		const selectedIndex = findIndex( this.postKeys, postKey );
		if (
			this.isValidPostOrGap( this.postKeys[ selectedIndex ] ) &&
			selectedIndex !== this.selectedIndex
		) {
			this.selectedIndex = selectedIndex;
			this.emitChange();
		}
	}

	getLastItemWithDate() {
		if ( this.oldestPostDate ) {
			return this.oldestPostDate;
		}
		let i = this.postKeys.length - 1;
		if ( i === -1 ) {
			return;
		}

		let date;

		do {
			const key = this.postKeys[ i ];
			if ( ! key.isGap ) {
				date = key[ this.dateProperty ];
			}
			--i;
		} while ( ! date && i !== -1 );

		return date;
	}

	getFirstItemWithDate() {
		if ( this.postKeys.length === 0 ) {
			return;
		}

		let i = 0;
		let date;

		do {
			const key = this.postKeys[ i ];
			if ( ! key.isGap ) {
				date = key[ this.dateProperty ];
			}
			++i;
		} while ( ! date && i < this.postKeys.length );

		return date;
	}

	/**
	 * Checks if an error has occurred in the past minute.
	 *
	 * @param {string} errorType - Error type to check. If not provided, we'll check for errors of any type.
	 * @returns {bool} true if we have a recent error
	 */
	hasRecentError( errorType ) {
		const aMinuteAgo = Date.now() - 60 * 1000;
		return this.errors.some( function( error ) {
			return (
				error.timestamp &&
				error.timestamp > aMinuteAgo &&
				( ! errorType || errorType === error.error )
			);
		} );
	}

	setIsFetchingNextPage( val ) {
		this._isFetchingNextPage = val;
		this.emitChange();
	}

	pollForUpdates() {
		if ( this.isFetchingUpdates ) {
			debug( 'already fetching, skip' );
			return;
		}

		if ( ! this.postKeys.length ) {
			debug( 'skipping poll because we have no posts' );
			return;
		}

		// most recent post
		const mostRecentDate = this.getFirstItemWithDate();

		if ( ! mostRecentDate ) {
			return;
		}

		this.isFetchingUpdates = true;

		const params = {
			orderBy: this.orderBy,
			number: this.maxUpdates,
			before: moment().toISOString(),
			after: moment( mostRecentDate ).toISOString(),
		};

		this.onUpdateFetch( params );
		debug( 'polling for updates' );
		this.fetcher( params, ( error, data ) => {
			debug( 'poll response received', error, data );
			this.isFetchingUpdates = false;
			FeedStreamActions.receiveUpdates( this.id, error, data );
		} );
	}

	/**
	 * Returns a list of sites this url was cross posted to.
	 * @param {string} postURL - i.e.: https://developer.wordpress.com/blog/2015/10/08/this-is-just-to-say/
	 * @returns {array} - i.e. [ { siteURL: http://dailypost.wordpress.com/, siteName: "+dailypost" } ]
	 */
	getSitesCrossPostedTo( postURL ) {
		return this.xPostedByURL[ postURL ];
	}

	/**
	 * If possible, returns the post metadata from a given response.
	 * @param {object} postWrapper - response with post metadata
	 * @returns {*} - null or post object
	 * @private
	 */
	getPostFromMetadata( postWrapper ) {
		if ( postWrapper && get( postWrapper, 'meta.data.discover_original_post' ) ) {
			return postWrapper.meta.data.discover_original_post;
		} else if ( postWrapper && get( postWrapper, 'meta.data.post' ) ) {
			return postWrapper.meta.data.post;
		} else if ( postWrapper.feed_ID || postWrapper.site_ID ) {
			return postWrapper;
		}
		return null;
	}

	addXPost( postURL, xPostedBy ) {
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
	}

	/**
	 * Given a list of responses with post metadata, attempts to roll up
	 * applicable x-posts. Has a side effect of updating this.xPostedByURL
	 * so we can keep track of where a post has been x-posted to.
	 * @param {array} posts - a list of posts
	 * @returns {array} posts - a filtered list of posts
	 */
	filterFollowedXPosts( posts ) {
		// 		// TODO: this is broken for now -- reduxifying streams should fix this.
		return posts;
		// return posts.filter( postWrapper => {
		// 	const post = this.getPostFromMetadata( postWrapper );
		// 	//note that the post hasn't been normalized yet.
		// 	if ( post && post.tags && post.tags[ 'p2-xpost' ] ) {
		// 		const xPostMetadata = XPostHelper.getXPostMetadata( post );
		// 		if ( ! xPostMetadata.postURL ) {
		// 			// we don't have the information to render this x-post
		// 			return false;
		// 		}
		// 		const isFollowing = FeedSubscriptionStore.getIsFollowingBySiteUrl( xPostMetadata.siteURL );
		// 		// x-post sites are tagged with `+subdomain`
		// 		const siteName = `+${ url.parse( post.site_URL ).hostname.split( '.' )[ 0 ] }`;
		// 		// keep track of where we cross-posted to, so we can add
		// 		// this info to the original post.
		// 		const xPostedBy = {
		// 			siteURL: post.site_URL,
		// 			siteName: siteName,
		// 		};
		// 		this.addXPost( xPostMetadata.postURL, xPostedBy );
		// 		// also keep track of origin comment urls, so we can roll up
		// 		// multiple x-posts from a single origin comment.
		// 		if ( xPostMetadata.commentURL ) {
		// 			this.addXPost( xPostMetadata.commentURL, xPostedBy );
		// 			return this.xPostedByURL[ xPostMetadata.commentURL ].length === 1;
		// 		}
		// 		if ( ! isFollowing ) {
		// 			//only leave the topmost as a notice
		// 			return this.xPostedByURL[ xPostMetadata.postURL ].length === 1;
		// 		}
		// 		return false;
		// 	}
		// 	return true;
		// } );
	}

	filterNewPosts( posts ) {
		const postById = this.postById;
		posts = filter( posts, post => {
			return ! postById.has( keyToString( this.keyMaker( post ) ) );
		} );
		posts = this.filterFollowedXPosts( posts );
		return map( posts, this.keyMaker );
	}

	receivePage( id, error, data ) {
		if ( id !== this.id ) {
			return;
		}

		debug( 'receiving page in %s', this.id );

		this._isFetchingNextPage = false;
		this.oldestPostDate = get( data, [ 'date_range', 'after' ] );
		this.lastPageHandle = get( data, [ 'meta', 'next_page' ], null );

		if ( error ) {
			debug( 'Error fetching posts from API:', error );
			error.timestamp = Date.now();
			this.errors.push( error );
			this.emitChange();
			return;
		}

		const posts = data && data.posts;

		if ( ! posts ) {
			this.emitChange();
			return;
		}

		if ( ! posts.length ) {
			this._isLastPage = true;
			this.emitChange();
			return;
		}

		const postKeys = this.filterNewPosts( posts );

		if ( postKeys.length ) {
			const postById = this.postById;
			forEach( postKeys, function( postKey ) {
				postById.add( keyToString( postKey ) );
			} );
			this.postKeys = this.postKeys.concat( postKeys );
		}

		this.page++;
		this.emitChange();
	}

	receiveUpdates( id, error, data ) {
		if ( id !== this.id ) {
			return;
		}

		if ( error ) {
			return;
		}

		// pull in the updates. might cause a gap.
		if ( data && data.posts ) {
			const postKeys = this.filterNewPosts( data.posts );
			if ( postKeys.length > 0 ) {
				this.pendingPostKeys = postKeys;
				this.pendingDateAfter = moment(
					this.keyMaker( data.posts[ data.posts.length - 1 ] )[ this.dateProperty ]
				);
				this.emitChange();
			}
		}

		// if conversations, then tuck away the comments into pending comments
		if ( data && data.posts && data.posts[ 0 ] && data.posts[ 0 ].comments ) {
			forEach( data.posts, post => {
				const postKey = { blogId: post.site_ID, postId: post.ID };
				this.pendingComments.set( postKeyToString( postKey ), post.comments );
			} );
		}
	}

	acceptUpdates() {
		if ( this.pendingPostKeys.length === 0 ) {
			return;
		}

		const postById = this.postById;
		forEach( this.pendingPostKeys, function( postKey ) {
			postById.add( keyToString( postKey ) );
		} );

		const mostRecentPostDate = moment( this.postKeys[ 0 ][ this.dateProperty ] );

		// if the first element in the current postKeys isn't also in the pending set,
		// we have a possible gap
		const firstKey = this.postKeys[ 0 ];
		if (
			! some( this.pendingPostKeys, pendingKey => keysAreEqual( pendingKey, firstKey ) ) &&
			this.pendingDateAfter > mostRecentPostDate
		) {
			this.pendingPostKeys.push( {
				isGap: true,
				from: mostRecentPostDate,
				to: this.pendingDateAfter,
			} );
		}

		// if conversations, then unleash the tucked away comments to redux
		if ( !! get( this.pendingPostKeys, '0.comments' ) ) {
			forEach( this.pendingPostKeys, postKey => {
				const key = postKeyToString( postKey );
				const comments = this.pendingComments.get( key );
				this.pendingComments.delete( key );

				reduxDispatch( {
					type: COMMENTS_RECEIVE,
					siteId: postKey.blogId,
					postId: postKey.postId,
					comments,
				} );
			} );
		}

		this.postKeys = uniqBy( this.pendingPostKeys.concat( this.postKeys ), postKey =>
			keyToString( postKey )
		);
		if ( this.selectedIndex > -1 ) {
			//we already scroll to top of content, so deselect so we don't
			//try to scroll down again.
			this.selectedIndex = -1;
		}
		this.pendingPostKeys = [];
		this.pendingComments.clear();
		this.pendingDateAfter = null;
		this.emitChange();
	}

	receiveFeedGap( gap, error, data ) {
		if ( error ) {
			this.errors.push( error );
			this.emitChange();
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
			afterGapDate = moment( afterGap[ 0 ][ this.dateProperty ] );

		if ( posts.length === this.gapFillCount ) {
			if ( moment( posts[ posts.length - 1 ][ this.dateProperty ] ) > afterGapDate ) {
				// we still might have a gap
				gapItems.push( {
					isGap: true,
					from: afterGapDate,
					to: moment( posts[ posts.length - 1 ][ this.dateProperty ] ),
				} );
			}
		}

		this.postKeys = beforeGap.concat( gapItems, afterGap );

		this.emitChange();
	}
}

Emitter( FeedStream.prototype );
