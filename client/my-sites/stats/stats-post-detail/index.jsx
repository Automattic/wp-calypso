/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import page from 'page';
import { localize } from 'i18n-calypso';
import { flowRight } from 'lodash';

/**
 * Internal dependencies
 */
import Emojify from 'components/emojify';
import PostSummary from '../stats-post-summary';
import PostMonths from '../stats-detail-months';
import PostWeeks from '../stats-detail-weeks';
import StatsPlaceholder from '../stats-module/placeholder';
import HeaderCake from 'components/header-cake';
import { decodeEntities } from 'lib/formatting';
import Main from 'components/main';
import titlecase from 'to-title-case';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import PostLikes from '../stats-post-likes';
import QueryPosts from 'components/data/query-posts';
import QueryPostStats from 'components/data/query-post-stats';
import EmptyContent from 'components/empty-content';
import { getPostStat, isRequestingPostStats } from 'state/stats/posts/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { Button } from '@automattic/components';
import { getSiteSlug, isJetpackSite, isSitePreviewable } from 'state/sites/selectors';
import { getSitePost, isRequestingSitePost, getPostPreviewUrl } from 'state/posts/selectors';
import hasNavigated from 'state/selectors/has-navigated';
import WebPreview from 'components/web-preview';

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
				title = <Emojify>{ decodeEntities( post.title ) }</Emojify>;
			}
		}

		if ( ! postOnRecord && ! isRequestingPost ) {
			title = translate( "We don't have that post on record yet." );
		}

		const postType = post && post.type !== null ? post.type : 'post';
		let actionLabel, noViewsLabel;

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
							title={ translate( 'Months and Years' ) }
							total={ translate( 'Total' ) }
							siteId={ siteId }
							postId={ postId }
						/>

						<PostMonths
							dataKey="averages"
							title={ translate( 'Average per Day' ) }
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
