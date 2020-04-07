/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { isEqual, range, throttle, difference, isEmpty, get } from 'lodash';
import { localize, getLocaleSlug } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import afterLayoutFlush from 'lib/after-layout-flush';
import QueryPosts from 'components/data/query-posts';
import QueryRecentPostViews from 'components/data/query-stats-recent-post-views';
import { DEFAULT_POST_QUERY } from 'lib/query-manager/post/constants';
import { getSelectedSiteId } from 'state/ui/selectors';
import isVipSite from 'state/selectors/is-vip-site';
import {
	isRequestingPostsForQueryIgnoringPage,
	getPostsForQueryIgnoringPage,
	getPostsFoundForQuery,
	getPostsLastPageForQuery,
} from 'state/posts/selectors';
import { getPostType, getPostTypeLabel } from 'state/post-types/selectors';
import { getEditorUrl } from 'state/selectors/get-editor-url';
import ListEnd from 'components/list-end';
import PostItem from 'blocks/post-item';
import PostTypeListEmptyContent from './empty-content';
import PostTypeListMaxPagesNotice from './max-pages-notice';
import SectionHeader from 'components/section-header';
import { Button } from '@automattic/components';
import UpsellNudge from 'blocks/upsell-nudge';
import { FEATURE_NO_ADS } from 'lib/plans/constants';

/**
 * Style dependencies
 */
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
		isVip: PropTypes.bool,
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
		return ! isEmpty( posts ) ? posts.map( post => post.ID ) : [];
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
		const { query, siteId, isRequestingPosts, translate, isVip } = this.props;
		const { maxRequestedPage, recentViewIds } = this.state;
		const posts = this.props.posts || [];
		const postStatuses = query.status.split( ',' );
		const isLoadedAndEmpty = query && ! posts.length && ! isRequestingPosts;
		const classes = classnames( 'post-type-list', {
			'is-empty': isLoadedAndEmpty,
		} );

		const isSingleSite = !! siteId;

		const showUpgradeNudge =
			siteId &&
			posts.length > 10 &&
			! isVip &&
			query &&
			( query.type === 'post' || ! query.type ) &&
			( postStatuses.includes( 'publish' ) || postStatuses.includes( 'private' ) );

		return (
			<div className={ classes }>
				{ this.renderSectionHeader() }
				{ query &&
					range( 1, maxRequestedPage + 1 ).map( page => (
						<QueryPosts key={ `query-${ page }` } siteId={ siteId } query={ { ...query, page } } />
					) ) }
				{ /* Disable Querying recent views in all-sites mode as it doesn't work without sideId. */ }
				{ isSingleSite && recentViewIds.length > 0 && (
					<QueryRecentPostViews siteId={ siteId } postIds={ recentViewIds } num={ 30 } />
				) }
				{ posts.slice( 0, 10 ).map( this.renderPost ) }
				{ showUpgradeNudge && (
					<UpsellNudge
						title={ translate( 'No Ads with WordPress.com Premium' ) }
						description={ translate( 'Prevent ads from showing on your site.' ) }
						feature={ FEATURE_NO_ADS }
						event="published_posts_no_ads"
						tracksImpressionName="calypso_upgrade_nudge_impression"
						tracksClickName="calypso_upgrade_nudge_cta_click"
						showIcon={ true }
					/>
				) }
				{ posts.slice( 10 ).map( this.renderPost ) }
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
		isVip: isVipSite( state, siteId ),
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
