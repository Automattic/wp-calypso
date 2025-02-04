import { Button } from '@automattic/components';
import clsx from 'clsx';
import { localize, getLocaleSlug } from 'i18n-calypso';
import { isEqual, range, throttle, difference, isEmpty, get } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import SitePreview from 'calypso/blocks/site-preview';
import QueryPosts from 'calypso/components/data/query-posts';
import QueryRecentPostViews from 'calypso/components/data/query-stats-recent-post-views';
import ListEnd from 'calypso/components/list-end';
import SectionHeader from 'calypso/components/section-header';
import afterLayoutFlush from 'calypso/lib/after-layout-flush';
import { DEFAULT_POST_QUERY } from 'calypso/lib/query-manager/post/constants';
import { getPostType, getPostTypeLabel } from 'calypso/state/post-types/selectors';
import {
	isRequestingPostsForQueryIgnoringPage,
	getPostsForQueryIgnoringPage,
	getPostsFoundForQuery,
	getPostsLastPageForQuery,
} from 'calypso/state/posts/selectors';
import { getEditorUrl } from 'calypso/state/selectors/get-editor-url';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import PostTypeListEmptyContent from './empty-content';
import PostTypeListMaxPagesNotice from './max-pages-notice';
import PostItem from './post-item';

import './style.scss';

/**
 * Constants
 */
// The maximum number of pages of results that can be displayed in "All My
// Sites" (API endpoint limitation).
const MAX_ALL_SITES_PAGES = 10;

class PostTypeList extends Component {
	static propTypes = {
		// Props
		query: PropTypes.object,
		showPublishedStatus: PropTypes.bool,
		scrollContainer: PropTypes.object,

		// Connected props
		siteId: PropTypes.number,
		posts: PropTypes.array,
		isRequestingPosts: PropTypes.bool,
		totalPostCount: PropTypes.number,
		totalPageCount: PropTypes.number,
		lastPageToRequest: PropTypes.number,
	};

	constructor( props ) {
		super( props );

		this.renderPost = this.renderPost.bind( this );
		this.renderPlaceholder = this.renderPlaceholder.bind( this );

		this.maybeLoadNextPage = this.maybeLoadNextPage.bind( this );
		this.maybeLoadNextPageThrottled = throttle( this.maybeLoadNextPage, 100 );
		this.maybeLoadNextPageAfterLayoutFlush = afterLayoutFlush( this.maybeLoadNextPage );

		const maxRequestedPage = this.estimatePageCountFromPosts( this.props.posts );
		this.state = {
			maxRequestedPage,
			// Request recent views for posts loaded from hydrated state.
			recentViewIds: this.postIdsFromPosts( this.props.posts ),
		};
	}

	componentDidMount() {
		this.maybeLoadNextPageAfterLayoutFlush();
		window.addEventListener( 'scroll', this.maybeLoadNextPageThrottled );
	}

	// @TODO: Please update https://github.com/Automattic/wp-calypso/issues/58453 if you are refactoring away from UNSAFE_* lifecycle methods!
	UNSAFE_componentWillReceiveProps( nextProps ) {
		if (
			! isEqual( this.props.query, nextProps.query ) ||
			! isEqual( this.props.siteId, nextProps.siteId )
		) {
			const maxRequestedPage = this.estimatePageCountFromPosts( nextProps.posts );
			this.setState( {
				maxRequestedPage,
			} );
		}

		if ( ! isEqual( this.props.posts, nextProps.posts ) ) {
			const postIds = this.postIdsFromPosts( this.props.posts );
			const nextPostIds = this.postIdsFromPosts( nextProps.posts );

			// Request updated recent view counts for posts added to list.
			this.setState( {
				recentViewIds: difference( nextPostIds, postIds ),
			} );
		}
	}

	componentDidUpdate( prevProps ) {
		if ( prevProps.isRequestingPosts && ! this.props.isRequestingPosts ) {
			// We just finished loading a page.  If the bottom of the list is
			// still visible on screen (or almost visible), then we should go
			// ahead and load the next page.
			this.maybeLoadNextPageAfterLayoutFlush();
		}
	}

	componentWillUnmount() {
		window.removeEventListener( 'scroll', this.maybeLoadNextPageThrottled );
		this.maybeLoadNextPageThrottled.cancel(); // Cancel any pending scroll events
		this.maybeLoadNextPageAfterLayoutFlush.cancel();
	}

	estimatePageCountFromPosts( posts ) {
		// When loading posts from persistent storage, we want to avoid making
		// a bunch of sequential requests when the user scrolls down to the end
		// of the list.  However, we want to still request the posts, in case
		// some data has changed since the last page reload.  This will spawn a
		// number of concurrent requests for different pages of the posts list.

		if ( ! posts || ! posts.length ) {
			return 1;
		}

		const postsPerPage = this.getPostsPerPageCount();
		const pageCount = Math.ceil( posts.length / postsPerPage );

		// Avoid making more than 5 concurrent requests on page load.
		return Math.min( pageCount, 5 );
	}

	postIdsFromPosts( posts ) {
		return ! isEmpty( posts ) ? posts.map( ( post ) => post.ID ) : [];
	}

	getPostsPerPageCount() {
		const query = this.props.query || {};
		return query.number || DEFAULT_POST_QUERY.number;
	}

	getScrollTop() {
		const { scrollContainer } = this.props;
		if ( ! scrollContainer ) {
			return null;
		}
		if ( scrollContainer === document.body ) {
			return 'scrollY' in window ? window.scrollY : document.documentElement.scrollTop;
		}
		return scrollContainer.scrollTop;
	}

	hasListFullyLoaded() {
		const { lastPageToRequest, isRequestingPosts } = this.props;
		const { maxRequestedPage } = this.state;

		return ! isRequestingPosts && maxRequestedPage >= lastPageToRequest;
	}

	maybeLoadNextPage() {
		const { scrollContainer, lastPageToRequest, isRequestingPosts } = this.props;
		const { maxRequestedPage } = this.state;
		if ( ! scrollContainer || isRequestingPosts || maxRequestedPage >= lastPageToRequest ) {
			return;
		}

		const scrollTop = this.getScrollTop();
		const { scrollHeight, clientHeight } = scrollContainer;
		const pixelsBelowViewport = scrollHeight - scrollTop - clientHeight;

		// When the currently loaded list has this many pixels or less
		// remaining below the viewport, begin loading the next page of items.
		const thresholdPixels = Math.max( clientHeight, 400 );
		if (
			typeof scrollTop !== 'number' ||
			typeof scrollHeight !== 'number' ||
			typeof clientHeight !== 'number' ||
			pixelsBelowViewport > thresholdPixels
		) {
			return;
		}

		this.setState( { maxRequestedPage: maxRequestedPage + 1 } );
	}

	renderSectionHeader() {
		const { editorUrl, postLabels, addNewItemLabel } = this.props;

		if ( ! postLabels ) {
			return null;
		}

		return (
			<SectionHeader label={ postLabels.name }>
				<Button primary compact className="post-type-list__add-post" href={ editorUrl }>
					{ addNewItemLabel }
				</Button>
			</SectionHeader>
		);
	}

	renderListEnd() {
		const posts = this.props.posts || [];
		return this.hasListFullyLoaded() && posts.length > 0 ? <ListEnd /> : null;
	}

	renderMaxPagesNotice() {
		const { siteId, totalPageCount, totalPostCount } = this.props;
		const isTruncated =
			null === siteId && this.hasListFullyLoaded() && totalPageCount > MAX_ALL_SITES_PAGES;

		if ( ! isTruncated ) {
			return null;
		}

		const displayedPosts = this.getPostsPerPageCount() * MAX_ALL_SITES_PAGES;

		return (
			<PostTypeListMaxPagesNotice displayedPosts={ displayedPosts } totalPosts={ totalPostCount } />
		);
	}

	renderPlaceholder() {
		return this.props.isRequestingPosts ? <PostItem key="placeholder" /> : null;
	}

	renderPost( post ) {
		const globalId = post.global_ID;
		const { query, showPublishedStatus } = this.props;

		return (
			<PostItem
				key={ globalId }
				globalId={ globalId }
				singleUserQuery={ query && !! query.author }
				showPublishedStatus={ showPublishedStatus }
			/>
		);
	}

	render() {
		const { query, siteId, isRequestingPosts } = this.props;
		const { maxRequestedPage, recentViewIds } = this.state;
		const posts = this.props.posts || [];
		const isLoadedAndEmpty = query && ! posts.length && ! isRequestingPosts;
		const classes = clsx( 'post-type-list', {
			'is-empty': isLoadedAndEmpty,
		} );

		const isSingleSite = !! siteId;

		return (
			<div className={ classes }>
				{ this.renderSectionHeader() }
				{ query &&
					range( 1, maxRequestedPage + 1 ).map( ( page ) => (
						<QueryPosts key={ `query-${ page }` } siteId={ siteId } query={ { ...query, page } } />
					) ) }
				{ /* Disable Querying recent views in all-sites mode as it doesn't work without sideId. */ }
				{ isSingleSite && recentViewIds.length > 0 && (
					<QueryRecentPostViews siteId={ siteId } postIds={ recentViewIds } num={ 30 } />
				) }
				<SitePreview />
				{ posts.map( this.renderPost ) }
				{ isLoadedAndEmpty && (
					<PostTypeListEmptyContent type={ query.type } status={ query.status } />
				) }
				{ this.renderMaxPagesNotice() }
				{ this.renderPlaceholder() }
				{ this.renderListEnd() }
			</div>
		);
	}
}

export default connect( ( state, ownProps ) => {
	const siteId = getSelectedSiteId( state );

	const totalPageCount = getPostsLastPageForQuery( state, siteId, ownProps.query );
	const lastPageToRequest =
		siteId === null ? Math.min( MAX_ALL_SITES_PAGES, totalPageCount ) : totalPageCount;
	const localeSlug = getLocaleSlug( state );
	return {
		siteId,
		posts: getPostsForQueryIgnoringPage( state, siteId, ownProps.query ),
		isRequestingPosts: isRequestingPostsForQueryIgnoringPage( state, siteId, ownProps.query ),
		totalPostCount: getPostsFoundForQuery( state, siteId, ownProps.query ),
		totalPageCount,
		lastPageToRequest,
		editorUrl: getEditorUrl( state, siteId, null, ownProps.query.type ),
		postLabels: get( getPostType( state, siteId, ownProps.query.type ), 'labels' ),
		addNewItemLabel: getPostTypeLabel(
			state,
			siteId,
			ownProps.query.type,
			'add_new_item',
			localeSlug
		),
	};
} )( localize( PostTypeList ) );
