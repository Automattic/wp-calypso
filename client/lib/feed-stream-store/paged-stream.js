/** @format */
/**
 * External dependencies
 */
import { assign, filter, findIndex, findLastIndex, forEach, last, map, defer } from 'lodash';
import debugFactory from 'debug';

const debug = debugFactory( 'calypso:feed-store:post-list-store' );

/**
 * Internal Dependencies
 */
import Emitter from 'lib/mixins/emitter';
import { action as ActionTypes } from './constants';
import * as FeedStreamActions from './actions';
import { reduxGetState } from 'lib/redux-bridge';
import { getPostByKey } from 'state/reader/posts/selectors';

export default class PagedStream {
	constructor( spec ) {
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
			postById: new Set(),
			errors: [],
			fetcher: spec.fetcher,
			page: 1,
			perPage: spec.perPage || 10,
			query: spec.query,
			selectedIndex: -1,
			orderBy: 'date',
			_isLastPage: false,
			_isFetchingNextPage: false,
			keyMaker: spec.keyMaker,
		} );
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
			case ActionTypes.SELECT_FIRST_ITEM:
				this.selectFirstItem();
				break;
			case ActionTypes.DISMISS_POST:
				this.dismissPost( action.postKey );
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
		return 0;
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

	getSelectedIndex() {
		return this.selectedIndex;
	}

	isLastPage() {
		return this._isLastPage;
	}

	isFetchingNextPage() {
		return this._isFetchingNextPage;
	}

	isValidPostOrGap( postKey ) {
		if ( postKey.isGap ) {
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
		}
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

	onNextPageFetch( params ) {
		params.offset = ( this.page - 1 ) * this.perPage;
		params.before = this.startDate || undefined;
		params.after = undefined;
		params.number = this.perPage;
	}

	getLastItemWithDate() {
		return null;
	}

	getFirstItemWithDate() {
		return null;
	}

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

	filterNewPosts( posts ) {
		const postById = this.postById;
		posts = filter( posts, function( post ) {
			return ! postById.has( post.ID );
		} );
		return map( posts, this.keyMaker );
	}

	getSitesCrossPostedTo() {
		return null;
	}

	receivePage( id, error, data ) {
		if ( id !== this.id ) {
			return;
		}

		debug( 'receiving page in %s', this.id );

		this._isFetchingNextPage = false;

		if ( error ) {
			debug( 'Error fetching posts from API:', error );
			error.timestamp = Date.now();
			this.errors.push( error );
			this.emitChange();
			return;
		}

		const posts = data && data.posts;

		if ( ! posts ) {
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
				postById.add( postKey.postId );
			} );
			this.postKeys = this.postKeys.concat( postKeys );
			this.page++;
			this.emitChange();
		}
	}

	// pop the last item off the end and insert in the place of the dismissed post
	dismissPost( postKey ) {
		const indexToRemove = findIndex( this.postKeys, postKey );
		if ( indexToRemove === -1 ) {
			return;
		}
		const newPostKeys = [ ...this.postKeys ];
		const lastItem = last( newPostKeys );
		const removedItem = newPostKeys[ indexToRemove ];
		newPostKeys[ indexToRemove ] = lastItem;
		newPostKeys.pop();
		this.postById.delete( removedItem.postId );
		this.postKeys = newPostKeys;
		this.emitChange();
	}
}

Emitter( PagedStream.prototype );
