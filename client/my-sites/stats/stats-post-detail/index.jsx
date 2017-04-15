/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import page from 'page';
import { localize } from 'i18n-calypso';
import { flowRight } from 'lodash';

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
import StatsFirstView from '../stats-first-view';
import PostLikes from '../stats-post-likes';
import QueryPosts from 'components/data/query-posts';
import QueryPostStats from 'components/data/query-post-stats';
import EmptyContent from 'components/empty-content';
import { getPostStat, isRequestingPostStats } from 'state/stats/posts/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import Button from 'components/button';
import WebPreview from 'components/web-preview';
import { getSiteSlug, isJetpackSite, isSitePreviewable } from 'state/sites/selectors';
import { getSitePost, isRequestingSitePost, getPostPreviewUrl } from 'state/posts/selectors';

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
	};

	state = {
		showPreview: false
	};

	goBack = () => {
		const pathParts = this.props.path.split( '/' );
		const defaultBack = '/stats/' + pathParts[ pathParts.length - 1 ];

		page( this.props.context.prevPath || defaultBack );
	}

	componentDidMount() {
		window.scrollTo( 0, 0 );
	}

	openPreview = () => {
		this.setState( {
			showPreview: true
		} );
	}

	closePreview = () => {
		this.setState( {
			showPreview: false
		} );
	}

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
			previewUrl
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
			title = translate( 'We don\'t have that post on record yet.' );
		}

		return (
			<Main wideLayout>
				{ siteId && <QueryPosts siteId={ siteId } postId={ postId } /> }
				{ siteId && <QueryPostStats siteId={ siteId } postId={ postId } /> }

				<StatsFirstView />

				<HeaderCake
					onClick={ this.goBack }
					actionIcon={ showViewLink ? 'visible' : null }
					actionText={ showViewLink ? translate( 'View Post' ) : null }
					actionOnClick={ showViewLink ? this.openPreview : null }
					>
					{ title }
				</HeaderCake>

				<StatsPlaceholder isLoading={ isLoading } />

				{ ! isLoading && countViews === 0 &&
					<EmptyContent
						title={ translate( 'Your post has not received any views yet!' ) }
						line={ translate( 'Learn some tips to attract more visitors' ) }
						action={ translate( 'Get more traffic!' ) }
						actionURL="https://en.support.wordpress.com/getting-more-views-and-traffic/"
						actionTarget="blank"
						illustration="/calypso/images/stats/illustration-stats.svg"
						illustrationWidth={ 150 }
					/>
				}

				{ ! isLoading && countViews > 0 &&
					<div>
						<PostSummary siteId={ siteId } postId={ postId } />

						{ !! postId && <PostLikes siteId={ siteId } postId={ postId } /> }

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
				}

				<WebPreview
					showPreview={ this.state.showPreview }
					defaultViewportDevice="tablet"
					previewUrl={ `${ previewUrl }?demo=true&iframe=true&theme_preview=true` }
					externalUrl={ previewUrl }
					onClose={ this.closePreview }
					loadingMessage="Beep beep boop…"
				>
					<Button href={ `/post/${ siteSlug }/${ postId }` }>
						{ translate( 'Edit' ) }
					</Button>
				</WebPreview>
			</Main>
		);
	}
}

const connectComponent = connect(
	( state, { postId } ) => {
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
			siteId,
		};
	}
);

export default flowRight(
	connectComponent,
	localize,
)( StatsPostDetail );
