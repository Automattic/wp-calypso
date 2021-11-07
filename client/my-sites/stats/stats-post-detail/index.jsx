import { Button } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { flowRight } from 'lodash';
import page from 'page';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import titlecase from 'to-title-case';
import QueryPostStats from 'calypso/components/data/query-post-stats';
import QueryPosts from 'calypso/components/data/query-posts';
import EmptyContent from 'calypso/components/empty-content';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import WebPreview from 'calypso/components/web-preview';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { decodeEntities, stripHTML } from 'calypso/lib/formatting';
import {
	getSitePost,
	isRequestingSitePost,
	getPostPreviewUrl,
} from 'calypso/state/posts/selectors';
import hasNavigated from 'calypso/state/selectors/has-navigated';
import { getSiteSlug, isJetpackSite, isSitePreviewable } from 'calypso/state/sites/selectors';
import { getPostStat, isRequestingPostStats } from 'calypso/state/stats/posts/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
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
		isRequestingPost: PropTypes.bool,
		isRequestingStats: PropTypes.bool,
		countViews: PropTypes.number,
		post: PropTypes.object,
		siteSlug: PropTypes.string,
		showViewLink: PropTypes.bool,
		previewUrl: PropTypes.string,
		hasNavigated: PropTypes.bool,
	};

	state = {
		showPreview: false,
	};

	goBack = () => {
		if ( window.history.length > 1 && this.props.hasNavigated ) {
			window.history.back();
			return;
		}

		const pathParts = this.props.path.split( '/' );
		page( '/stats/' + pathParts[ pathParts.length - 1 ] );
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

	render() {
		const {
			isRequestingPost,
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
		const postOnRecord = post && post.title !== null;
		const isLoading = isRequestingStats && ! countViews;
		let title;
		if ( postOnRecord ) {
			if ( typeof post.title === 'string' && post.title.length ) {
				title = decodeEntities( stripHTML( post.title ) );
			}
		}

		if ( ! postOnRecord && ! isRequestingPost ) {
			title = translate( "We don't have that post on record yet." );
		}

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

		return (
			<Main wideLayout>
				<PageViewTracker
					path={ `/stats/${ postType }/:post_id/:site` }
					title={ `Stats > Single ${ titlecase( postType ) }` }
				/>
				{ siteId && <QueryPosts siteId={ siteId } postId={ postId } /> }
				{ siteId && <QueryPostStats siteId={ siteId } postId={ postId } /> }

				<HeaderCake
					onClick={ this.goBack }
					actionIcon={ showViewLink ? 'visible' : null }
					actionText={ showViewLink ? actionLabel : null }
					actionOnClick={ showViewLink ? this.openPreview : null }
				>
					{ title }
				</HeaderCake>

				<StatsPlaceholder isLoading={ isLoading } />

				{ ! isLoading && countViews === 0 && (
					<EmptyContent
						title={ noViewsLabel }
						line={ translate( 'Learn some tips to attract more visitors' ) }
						action={ translate( 'Get more traffic!' ) }
						actionURL="https://wordpress.com/support/getting-more-views-and-traffic/"
						actionTarget="blank"
						illustration="/calypso/images/stats/illustration-stats.svg"
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

	return {
		post: getSitePost( state, siteId, postId ),
		isRequestingPost: isRequestingSitePost( state, siteId, postId ),
		countViews: getPostStat( state, siteId, postId, 'views' ),
		isRequestingStats: isRequestingPostStats( state, siteId, postId ),
		siteSlug: getSiteSlug( state, siteId ),
		showViewLink: ! isJetpack && isPreviewable,
		previewUrl: getPostPreviewUrl( state, siteId, postId ),
		hasNavigated: hasNavigated( state ),
		siteId,
	};
} );

export default flowRight( connectComponent, localize )( StatsPostDetail );
