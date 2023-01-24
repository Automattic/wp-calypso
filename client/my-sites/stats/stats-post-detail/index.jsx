import config from '@automattic/calypso-config';
import { Button } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { flowRight } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import titlecase from 'to-title-case';
import QueryPostStats from 'calypso/components/data/query-post-stats';
import QueryPosts from 'calypso/components/data/query-posts';
import EmptyContent from 'calypso/components/empty-content';
import FixedNavigationHeader from 'calypso/components/fixed-navigation-header';
import JetpackColophon from 'calypso/components/jetpack-colophon';
import Main from 'calypso/components/main';
import WebPreview from 'calypso/components/web-preview';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { decodeEntities, stripHTML } from 'calypso/lib/formatting';
import { getSitePost, getPostPreviewUrl } from 'calypso/state/posts/selectors';
import {
	getSiteOption,
	getSiteSlug,
	isJetpackSite,
	isSitePreviewable,
} from 'calypso/state/sites/selectors';
import { getPostStat, isRequestingPostStats } from 'calypso/state/stats/posts/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import PostDetailHighlightsSection from '../post-detail-highlights-section';
import PostDetailTableSection from '../post-detail-table-section';
import PostMonths from '../stats-detail-months';
import PostWeeks from '../stats-detail-weeks';
import StatsPlaceholder from '../stats-module/placeholder';
import PostLikes from '../stats-post-likes';
import PostSummary from '../stats-post-summary';

class StatsPostDetail extends Component {
	static propTypes = {
		path: PropTypes.string,
		siteId: PropTypes.number,
		postId: PropTypes.number,
		translate: PropTypes.func,
		context: PropTypes.object,
		isRequestingStats: PropTypes.bool,
		countViews: PropTypes.number,
		post: PropTypes.object,
		siteSlug: PropTypes.string,
		showViewLink: PropTypes.bool,
		previewUrl: PropTypes.string,
	};

	state = {
		showPreview: false,
	};

	getNavigationItemsWithTitle = ( title ) => {
		const localizedTabNames = {
			traffic: this.props.translate( 'Traffic' ),
			insights: this.props.translate( 'Insights' ),
			store: this.props.translate( 'Store' ),
			ads: this.props.translate( 'Ads' ),
		};
		const possibleBackLinks = {
			traffic: '/stats/day/',
			insights: '/stats/insights/',
			store: '/stats/store/',
			ads: '/stats/ads/',
		};
		// We track the parent tab via sessionStorage.
		const lastClickedTab = sessionStorage.getItem( 'jp-stats-last-tab' );
		const backLabel = localizedTabNames[ lastClickedTab ] || localizedTabNames.traffic;
		let backLink = possibleBackLinks[ lastClickedTab ] || possibleBackLinks.traffic;
		// Append the domain as needed.
		const domain = this.props.siteSlug;
		if ( domain?.length > 0 ) {
			backLink += domain;
		}
		// Wrap it up!
		return [ { label: backLabel, href: backLink }, { label: title } ];
	};

	componentDidMount() {
		window.scrollTo( 0, 0 );
	}

	openPreview = () => {
		this.setState( {
			showPreview: true,
		} );
	};

	closePreview = () => {
		this.setState( {
			showPreview: false,
		} );
	};

	getTitle() {
		const { isLatestPostsHomepage, post, postFallback, translate } = this.props;

		if ( isLatestPostsHomepage ) {
			return translate( 'Home page / Archives' );
		}

		if ( typeof post?.title === 'string' && post.title.length ) {
			return decodeEntities( stripHTML( post.title ) );
		}

		if ( typeof postFallback?.post_title === 'string' && postFallback.post_title.length ) {
			return decodeEntities( stripHTML( postFallback.post_title ) );
		}

		return null;
	}

	render() {
		const {
			isLatestPostsHomepage,
			isRequestingStats,
			countViews,
			post,
			postId,
			siteId,
			translate,
			siteSlug,
			showViewLink,
			previewUrl,
		} = this.props;
		const isLoading = isRequestingStats && ! countViews;

		const postType = post && post.type !== null ? post.type : 'post';
		let actionLabel;
		let noViewsLabel;

		if ( postType === 'page' ) {
			actionLabel = translate( 'View Page' );
			noViewsLabel = translate( 'Your page has not received any views yet!' );
		} else {
			actionLabel = translate( 'View Post' );
			noViewsLabel = translate( 'Your post has not received any views yet!' );
		}

		const isFeatured = config.isEnabled( 'stats/enhance-post-detail' );

		return isFeatured ? (
			<Main fullWidthLayout>
				<PageViewTracker
					path={ `/stats/${ postType }/:post_id/:site` }
					title={ `Stats > Single ${ titlecase( postType ) }` }
				/>
				{ siteId && ! isLatestPostsHomepage && <QueryPosts siteId={ siteId } postId={ postId } /> }
				{ siteId && <QueryPostStats siteId={ siteId } postId={ postId } /> }

				<div className="stats has-fixed-nav">
					<FixedNavigationHeader
						navigationItems={ this.getNavigationItemsWithTitle( this.getTitle() ) }
					>
						{ showViewLink && (
							<Button onClick={ this.openPreview }>
								<span>{ actionLabel }</span>
							</Button>
						) }
					</FixedNavigationHeader>

					<PostDetailHighlightsSection siteId={ siteId } postId={ postId } post={ post } />

					<StatsPlaceholder isLoading={ isLoading } />

					{ ! isLoading && countViews === 0 && (
						<EmptyContent
							title={ noViewsLabel }
							line={ translate( 'Learn some tips to attract more visitors' ) }
							action={ translate( 'Get more traffic!' ) }
							actionURL="https://wordpress.com/support/getting-more-views-and-traffic/"
							actionTarget="blank"
							illustration="calypso/assets/images/stats/illustration-stats.svg"
							illustrationWidth={ 150 }
						/>
					) }

					{ ! isLoading && countViews > 0 && (
						<>
							<PostSummary siteId={ siteId } postId={ postId } />
							<PostDetailTableSection siteId={ siteId } postId={ postId } />
						</>
					) }

					<JetpackColophon />
				</div>

				<WebPreview
					showPreview={ this.state.showPreview }
					defaultViewportDevice="tablet"
					previewUrl={ `${ previewUrl }?demo=true&iframe=true&theme_preview=true` }
					externalUrl={ previewUrl }
					onClose={ this.closePreview }
				>
					<Button href={ `/post/${ siteSlug }/${ postId }` }>{ translate( 'Edit' ) }</Button>
				</WebPreview>
			</Main>
		) : (
			<Main className="has-fixed-nav" wideLayout>
				<PageViewTracker
					path={ `/stats/${ postType }/:post_id/:site` }
					title={ `Stats > Single ${ titlecase( postType ) }` }
				/>
				{ siteId && ! isLatestPostsHomepage && <QueryPosts siteId={ siteId } postId={ postId } /> }
				{ siteId && <QueryPostStats siteId={ siteId } postId={ postId } /> }

				<FixedNavigationHeader
					navigationItems={ this.getNavigationItemsWithTitle( this.getTitle() ) }
				>
					{ showViewLink && (
						<Button onClick={ this.openPreview }>
							<span>{ actionLabel }</span>
						</Button>
					) }
				</FixedNavigationHeader>

				<StatsPlaceholder isLoading={ isLoading } />

				{ ! isLoading && countViews === 0 && (
					<EmptyContent
						title={ noViewsLabel }
						line={ translate( 'Learn some tips to attract more visitors' ) }
						action={ translate( 'Get more traffic!' ) }
						actionURL="https://wordpress.com/support/getting-more-views-and-traffic/"
						actionTarget="blank"
						illustration="calypso/assets/images/stats/illustration-stats.svg"
						illustrationWidth={ 150 }
					/>
				) }

				{ ! isLoading && countViews > 0 && (
					<div>
						<PostSummary siteId={ siteId } postId={ postId } />
						{ !! postId && <PostLikes siteId={ siteId } postId={ postId } postType={ postType } /> }
						<PostMonths
							dataKey="years"
							title={ translate( 'Months and years' ) }
							total={ translate( 'Total' ) }
							siteId={ siteId }
							postId={ postId }
						/>
						<PostMonths
							dataKey="averages"
							title={ translate( 'Average per day' ) }
							total={ translate( 'Overall' ) }
							siteId={ siteId }
							postId={ postId }
						/>
						<PostWeeks siteId={ siteId } postId={ postId } />
					</div>
				) }

				<JetpackColophon />

				<WebPreview
					showPreview={ this.state.showPreview }
					defaultViewportDevice="tablet"
					previewUrl={ `${ previewUrl }?demo=true&iframe=true&theme_preview=true` }
					externalUrl={ previewUrl }
					onClose={ this.closePreview }
				>
					<Button href={ `/post/${ siteSlug }/${ postId }` }>{ translate( 'Edit' ) }</Button>
				</WebPreview>
			</Main>
		);
	}
}

const connectComponent = connect( ( state, { postId } ) => {
	const siteId = getSelectedSiteId( state );
	const isJetpack = isJetpackSite( state, siteId );
	const isPreviewable = isSitePreviewable( state, siteId );
	const isLatestPostsHomepage =
		getSiteOption( state, siteId, 'show_on_front' ) === 'posts' && postId === 0;

	return {
		post: getSitePost( state, siteId, postId ),
		// NOTE: Post object from the stats response does not conform to the data structure returned by getSitePost!
		postFallback: getPostStat( state, siteId, postId, 'post' ),
		isLatestPostsHomepage,
		countViews: getPostStat( state, siteId, postId, 'views' ),
		isRequestingStats: isRequestingPostStats( state, siteId, postId ),
		siteSlug: getSiteSlug( state, siteId ),
		showViewLink: ! isJetpack && ! isLatestPostsHomepage && isPreviewable,
		previewUrl: getPostPreviewUrl( state, siteId, postId ),
		siteId,
	};
} );

export default flowRight( connectComponent, localize )( StatsPostDetail );
