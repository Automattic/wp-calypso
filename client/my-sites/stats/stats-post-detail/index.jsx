import { Button } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { localize } from 'i18n-calypso';
import { flowRight } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import titlecase from 'to-title-case';
import IllustrationStats from 'calypso/assets/images/stats/illustration-stats.svg';
import QueryPostStats from 'calypso/components/data/query-post-stats';
import QueryPosts from 'calypso/components/data/query-posts';
import EmptyContent from 'calypso/components/empty-content';
import JetpackColophon from 'calypso/components/jetpack-colophon';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import WebPreview from 'calypso/components/web-preview';
import { decodeEntities, stripHTML } from 'calypso/lib/formatting';
import { getSitePost, getPostPreviewUrl } from 'calypso/state/posts/selectors';
import { countPostLikes } from 'calypso/state/posts/selectors/count-post-likes';
import { getSiteSlug, isJetpackSite, isSitePreviewable } from 'calypso/state/sites/selectors';
import getEnvStatsFeatureSupportChecks from 'calypso/state/sites/selectors/get-env-stats-feature-supports';
import { getPostStat, isRequestingPostStats } from 'calypso/state/stats/posts/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import PostDetailHighlightsSection from '../post-detail-highlights-section';
import PostDetailTableSection from '../post-detail-table-section';
import StatsPlaceholder from '../stats-module/placeholder';
import PageViewTracker from '../stats-page-view-tracker';
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
		const { isPostHomepage, post, postFallback, translate } = this.props;

		if ( isPostHomepage ) {
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

	hasDontSendEmailPostToSubs( metadata ) {
		return metadata?.some( ( { key } ) => key === '_jetpack_dont_email_post_to_subs' );
	}

	getPost() {
		const { isPostHomepage, post, postFallback, countLikes } = this.props;

		const postBase = {
			title: this.getTitle(),
			type: isPostHomepage ? 'page' : 'post',
			like_count: countLikes || 0,
		};

		// Check if post is valid.
		if ( typeof post === 'object' && post?.title?.length ) {
			return {
				...postBase,
				date: post?.date,
				dont_email_post_to_subs: this.hasDontSendEmailPostToSubs( post?.metadata ),
				post_thumbnail: post?.post_thumbnail,
				comment_count: post?.discussion?.comment_count,
				type: post?.type,
			};
		}

		// Check if postFallback is valid.
		if ( typeof postFallback === 'object' && postFallback?.post_title?.length ) {
			return {
				...postBase,
				date: postFallback?.post_date_gmt,
				dont_email_post_to_subs: this.hasDontSendEmailPostToSubs( post?.metadata ),
				post_thumbnail: null,
				comment_count: parseInt( postFallback?.comment_count, 10 ),
				type: postFallback?.post_type,
			};
		}

		return postBase;
	}

	render() {
		const {
			isPostHomepage,
			isRequestingStats,
			countViews,
			postId,
			siteId,
			translate,
			siteSlug,
			showViewLink,
			previewUrl,
			supportsUTMStats,
		} = this.props;

		const isLoading = isRequestingStats && ! countViews;

		// Prepare post details to PostStatsCard from post or postFallback.
		const passedPost = this.getPost();

		const postType = passedPost && passedPost.type !== null ? passedPost.type : 'post';
		let actionLabel;
		let noViewsLabel;

		if ( postType === 'page' ) {
			actionLabel = translate( 'View Page' );
			noViewsLabel = translate( 'Your page has not received any views yet!' );
		} else {
			actionLabel = translate( 'View Post' );
			noViewsLabel = translate( 'Your post has not received any views yet!' );
		}

		return (
			<Main fullWidthLayout>
				<PageViewTracker
					path={ `/stats/${ postType }/:post_id/:site` }
					title={ `Stats > Single ${ titlecase( postType ) }` }
				/>
				{ siteId && ! isPostHomepage && <QueryPosts siteId={ siteId } postId={ postId } /> }
				{ siteId && <QueryPostStats siteId={ siteId } postId={ postId } /> }

				<div className="stats has-fixed-nav">
					<NavigationHeader navigationItems={ this.getNavigationItemsWithTitle( this.getTitle() ) }>
						{ showViewLink && (
							<Button onClick={ this.openPreview }>
								<span>{ actionLabel }</span>
							</Button>
						) }
					</NavigationHeader>

					<PostDetailHighlightsSection siteId={ siteId } postId={ postId } post={ passedPost } />

					<StatsPlaceholder isLoading={ isLoading } />

					{ ! isLoading && countViews === 0 && (
						<EmptyContent
							title={ noViewsLabel }
							line={ translate( 'Learn some tips to attract more visitors' ) }
							action={ translate( 'Get more traffic!' ) }
							actionURL={ localizeUrl(
								'https://wordpress.com/support/getting-more-views-and-traffic/'
							) }
							actionTarget="blank"
							illustration={ IllustrationStats }
							illustrationWidth={ 150 }
						/>
					) }

					{ ! isLoading && countViews > 0 && (
						<>
							<PostSummary
								siteId={ siteId }
								postId={ postId }
								supportsUTMStats={ supportsUTMStats }
							/>
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
		);
	}
}

const connectComponent = connect( ( state, { postId } ) => {
	const siteId = getSelectedSiteId( state );
	const isJetpack = isJetpackSite( state, siteId );
	const isPreviewable = isSitePreviewable( state, siteId );
	const isPostHomepage = postId === 0;
	const countLikes = countPostLikes( state, siteId, postId ) || 0;
	const { supportsUTMStats } = getEnvStatsFeatureSupportChecks( state, siteId );

	return {
		post: getSitePost( state, siteId, postId ),
		countLikes,
		// NOTE: Post object from the stats response does not conform to the data structure returned by getSitePost!
		postFallback: getPostStat( state, siteId, postId, 'post' ),
		isPostHomepage,
		countViews: getPostStat( state, siteId, postId, 'views' ),
		isRequestingStats: isRequestingPostStats( state, siteId, postId ),
		siteSlug: getSiteSlug( state, siteId ),
		showViewLink: ! isJetpack && ! isPostHomepage && isPreviewable,
		previewUrl: getPostPreviewUrl( state, siteId, postId ),
		siteId,
		supportsUTMStats,
	};
} );

export default flowRight( connectComponent, localize )( StatsPostDetail );
