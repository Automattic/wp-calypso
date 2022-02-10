import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import { times } from 'lodash';
import PropTypes from 'prop-types';
import { createRef, Component, Fragment } from 'react';
import ReactDom from 'react-dom';
import { connect } from 'react-redux';
import InfiniteList from 'calypso/components/infinite-list';
import ListEnd from 'calypso/components/list-end';
import MobileBackToSidebar from 'calypso/components/mobile-back-to-sidebar';
import { Interval, EVERY_MINUTE } from 'calypso/lib/interval';
import { PerformanceTrackerStop } from 'calypso/lib/performance-tracking';
import scrollTo from 'calypso/lib/scroll-to';
import ReaderMain from 'calypso/reader/components/reader-main';
import { keysAreEqual, keyToString, keyForPost } from 'calypso/reader/post-key';
import UpdateNotice from 'calypso/reader/update-notice';
import { showSelectedPost, getStreamType } from 'calypso/reader/utils';
import { PER_FETCH, INITIAL_FETCH } from 'calypso/state/data-layer/wpcom/read/streams';
import { viewStream } from 'calypso/state/reader-ui/actions';
import { resetCardExpansions } from 'calypso/state/reader-ui/card-expansions/actions';
import { getPostByKey } from 'calypso/state/reader/posts/selectors';
import { getBlockedSites } from 'calypso/state/reader/site-blocks/selectors';
import { requestPage, showUpdates } from 'calypso/state/reader/streams/actions';
import {
	getStream,
	getTransformedStreamItems,
	shouldRequestRecs,
} from 'calypso/state/reader/streams/selectors';
import EmptyContent from './empty';
import PostLifecycle from './post-lifecycle';
import PostPlaceholder from './post-placeholder';
import UnseenEmptyContent from './unseen-empty';
import './style.scss';

const GUESSED_POST_HEIGHT = 600;
const HEADER_OFFSET_TOP = 46;
const noop = () => {};
const pagesByKey = new Map();

class ReaderStream extends Component {
	static propTypes = {
		trackScrollPage: PropTypes.func.isRequired,
		suppressSiteNameLink: PropTypes.bool,
		showPostHeader: PropTypes.bool,
		showFollowInHeader: PropTypes.bool,
		onUpdatesShown: PropTypes.func,
		emptyContent: PropTypes.object,
		className: PropTypes.string,
		showDefaultEmptyContentIfMissing: PropTypes.bool,
		showPrimaryFollowButtonOnCards: PropTypes.bool,
		showMobileBackToSidebar: PropTypes.bool,
		placeholderFactory: PropTypes.func,
		followSource: PropTypes.string,
		isDiscoverStream: PropTypes.bool,
		shouldCombineCards: PropTypes.bool,
		useCompactCards: PropTypes.bool,
		isMain: PropTypes.bool,
		intro: PropTypes.object,
		forcePlaceholders: PropTypes.bool,
		recsStreamKey: PropTypes.string,
		includeSeenPosts: PropTypes.bool,
		sites: PropTypes.array,
	};

	static defaultProps = {
		showPostHeader: true,
		suppressSiteNameLink: false,
		showFollowInHeader: false,
		onUpdatesShown: noop,
		className: '',
		showDefaultEmptyContentIfMissing: true,
		showPrimaryFollowButtonOnCards: true,
		showMobileBackToSidebar: true,
		isDiscoverStream: false,
		shouldCombineCards: true,
		isMain: true,
		useCompactCards: false,
		intro: null,
		forcePlaceholders: false,
		includeSeenPosts: true,
		sites: [],
	};

	listRef = createRef();

	componentDidUpdate( { selectedPostKey, streamKey } ) {
		if ( streamKey !== this.props.streamKey ) {
			this.props.resetCardExpansions();
			this.props.viewStream( streamKey, window.location.pathname );
			this.fetchNextPage( {} );
		}

		if ( ! keysAreEqual( selectedPostKey, this.props.selectedPostKey ) ) {
			this.scrollToSelectedPost( true );
		}

		if ( this.props.shouldRequestRecs ) {
			this.props.requestPage( {
				streamKey: this.props.recsStreamKey,
				pageHandle: this.props.recsStream.pageHandle,
			} );
		}
	}

	_popstate = () => {
		if ( this.props.selectedPostKey && window.history.scrollRestoration !== 'manual' ) {
			this.scrollToSelectedPost( false );
		}
	};

	scrollToSelectedPost( animate ) {
		const HEADER_OFFSET = -80; // a fixed position header means we can't just scroll the element into view.
		const selectedNode = ReactDom.findDOMNode( this ).querySelector( '.is-selected' );
		if ( selectedNode ) {
			const documentElement = document.documentElement;
			selectedNode.focus();
			const windowTop =
				( window.pageYOffset || documentElement.scrollTop ) - ( documentElement.clientTop || 0 );
			const boundingClientRect = selectedNode.getBoundingClientRect();
			const scrollY = parseInt( windowTop + boundingClientRect.top + HEADER_OFFSET, 10 );
			if ( animate ) {
				scrollTo( {
					x: 0,
					y: scrollY,
					duration: 200,
				} );
			} else {
				window.scrollTo( 0, scrollY );
			}
		}
	}

	componentDidMount() {
		const { streamKey } = this.props;
		this.props.resetCardExpansions();
		this.props.viewStream( streamKey, window.location.pathname );
		this.fetchNextPage( {} );

		window.addEventListener( 'popstate', this._popstate );
		if ( 'scrollRestoration' in window.history ) {
			window.history.scrollRestoration = 'manual';
		}
	}

	componentWillUnmount() {
		window.removeEventListener( 'popstate', this._popstate );
		if ( 'scrollRestoration' in window.history ) {
			window.history.scrollRestoration = 'auto';
		}
	}

	getVisibleItemIndexes() {
		return (
			this.listRef.current &&
			this.listRef.current.getVisibleItemIndexes( { offsetTop: HEADER_OFFSET_TOP } )
		);
	}

	poll = () => {
		const { streamKey } = this.props;
		this.props.requestPage( { streamKey, isPoll: true } );
	};

	fetchNextPage = ( options, props = this.props ) => {
		const { streamKey, stream, startDate } = props;
		if ( options.triggeredByScroll ) {
			const page = pagesByKey.get( streamKey ) || 0;
			pagesByKey.set( streamKey, page + 1 );

			props.trackScrollPage( page );
		}
		const pageHandle = stream.pageHandle || { before: startDate };
		props.requestPage( { streamKey, pageHandle } );
	};

	showUpdates = () => {
		const { streamKey } = this.props;
		this.props.onUpdatesShown();
		this.props.showUpdates( { streamKey } );
		// @todo: do we need to shuffle?
		// if ( this.props.recommendationsStore ) {
		// 	shufflePosts( this.props.recommendationsStore.id );
		// }
		if ( this.listRef.current ) {
			this.listRef.current.scrollToTop();
		}
	};

	renderLoadingPlaceholders = () => {
		const { items } = this.props;
		const count = items.length === 0 ? INITIAL_FETCH : PER_FETCH;

		return times( count, ( i ) => {
			if ( this.props.placeholderFactory ) {
				return this.props.placeholderFactory( { key: 'feed-post-placeholder-' + i } );
			}
			return <PostPlaceholder key={ 'feed-post-placeholder-' + i } />;
		} );
	};

	getPostRef = ( postKey ) => {
		return keyToString( postKey );
	};

	renderPost = ( postKey, index ) => {
		const { selectedPostKey, streamKey } = this.props;
		const isSelected = !! ( selectedPostKey && keysAreEqual( selectedPostKey, postKey ) );

		const itemKey = this.getPostRef( postKey );
		const showPost = ( args ) =>
			showSelectedPost( {
				...args,
				postKey: postKey.isCombination ? keyForPost( args ) : postKey,
				streamKey,
			} );

		return (
			<Fragment key={ itemKey }>
				<PostLifecycle
					ref={ itemKey /* The ref is stored into `InfiniteList`'s `this.ref` map */ }
					isSelected={ isSelected }
					handleClick={ showPost }
					postKey={ postKey }
					suppressSiteNameLink={ this.props.suppressSiteNameLink }
					showPostHeader={ this.props.showPostHeader }
					showFollowInHeader={ this.props.showFollowInHeader }
					showPrimaryFollowButtonOnCards={ this.props.showPrimaryFollowButtonOnCards }
					isDiscoverStream={ this.props.isDiscoverStream }
					showSiteName={ this.props.showSiteNameOnCards }
					selectedPostKey={ postKey.isCombination ? selectedPostKey : undefined }
					followSource={ this.props.followSource }
					blockedSites={ this.props.blockedSites }
					streamKey={ streamKey }
					recsStreamKey={ this.props.recsStreamKey }
					index={ index }
					compact={ this.props.useCompactCards }
					includeSeenPosts={ this.props.includeSeenPosts }
				/>
				{ index === 0 && <PerformanceTrackerStop /> }
			</Fragment>
		);
	};

	render() {
		const { forcePlaceholders, lastPage, streamKey, sites, includeSeenPosts } = this.props;
		let { items, isRequesting } = this.props;

		const hasNoPosts = items.length === 0 && ! isRequesting;
		const hasUnseenPosts = sites.reduce(
			( acc, { unseen_count } ) => acc + ( unseen_count | 0 ),
			0
		);
		let body;
		let showingStream;

		// trick an infinite list to showing placeholders
		if ( forcePlaceholders ) {
			items = [];
			isRequesting = true;
		}

		// @TODO: has error of invalid tag?
		if ( hasNoPosts ) {
			body = this.props.emptyContent;
			if ( ! body && this.props.showDefaultEmptyContentIfMissing ) {
				body = <EmptyContent />;
			}
			showingStream = false;
		} else if ( ! includeSeenPosts && ! hasUnseenPosts ) {
			// we're on an "Unread" view but there are no posts to display
			body = <UnseenEmptyContent />;
			showingStream = false;
		} else {
			/* eslint-disable wpcalypso/jsx-classname-namespace */
			body = (
				<InfiniteList
					ref={ this.listRef }
					className="reader__content"
					items={ items }
					lastPage={ lastPage }
					fetchingNextPage={ isRequesting }
					guessedItemHeight={ GUESSED_POST_HEIGHT }
					fetchNextPage={ this.fetchNextPage }
					getItemRef={ this.getPostRef }
					renderItem={ this.renderPost }
					renderLoadingPlaceholders={ this.renderLoadingPlaceholders }
				/>
			);
			showingStream = true;
			/* eslint-enable wpcalypso/jsx-classname-namespace */
		}
		const streamType = getStreamType( streamKey );
		const shouldPoll = streamType !== 'search' && streamType !== 'custom_recs_posts_with_images';

		const TopLevel = this.props.isMain ? ReaderMain : 'div';
		return (
			<TopLevel className={ classnames( 'following', this.props.className ) }>
				{ shouldPoll && <Interval onTick={ this.poll } period={ EVERY_MINUTE } /> }
				{ this.props.isMain && this.props.showMobileBackToSidebar && (
					<MobileBackToSidebar>
						<h1>{ this.props.translate( 'Streams' ) }</h1>
					</MobileBackToSidebar>
				) }

				<UpdateNotice streamKey={ streamKey } onClick={ this.showUpdates } />
				{ this.props.children }
				{ showingStream && items.length ? this.props.intro : null }
				{ body }
				{ showingStream && items.length && ! isRequesting ? <ListEnd /> : null }
			</TopLevel>
		);
	}
}

export default connect(
	( state, { streamKey, recsStreamKey, shouldCombineCards = true } ) => {
		const stream = getStream( state, streamKey );
		const selectedPost = getPostByKey( state, stream.selected );

		return {
			blockedSites: getBlockedSites( state ),
			items: getTransformedStreamItems( state, {
				streamKey,
				recsStreamKey,
				shouldCombine: shouldCombineCards,
			} ),
			stream,
			recsStream: getStream( state, recsStreamKey ),
			selectedPostKey: stream.selected,
			selectedPost,
			lastPage: stream.lastPage,
			isRequesting: stream.isRequesting,
			shouldRequestRecs: shouldRequestRecs( state, streamKey, recsStreamKey ),
		};
	},
	{
		resetCardExpansions,
		requestPage,
		showUpdates,
		viewStream,
	}
)( localize( ReaderStream ) );
