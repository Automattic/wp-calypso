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
import HeaderCake from 'components/header-cake';
import { decodeEntities } from 'lib/formatting';
import Main from 'components/main';
import StatsFirstView from '../stats-first-view';
import PostLikes from '../stats-post-likes';
import QueryPosts from 'components/data/query-posts';
import QueryPostStats from 'components/data/query-post-stats';
import NoViewsPlaceholder from './no-views-placeholder';
import { getPostStat, isRequestingPostStats } from 'state/stats/posts/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSitePost, isRequestingSitePost } from 'state/posts/selectors';

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
		port: PropTypes.object,
	};

	goBack = () => {
		const pathParts = this.props.path.split( '/' );
		const defaultBack = '/stats/' + pathParts[ pathParts.length - 1 ];

		page( this.props.context.prevPath || defaultBack );
	}

	componentDidMount() {
		window.scrollTo( 0, 0 );
	}

	render() {
		const { isRequestingPost, isRequestingStats, countViews, post, postId, siteId, translate } = this.props;
		const postOnRecord = post && post.title !== null;
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

				{ ! isRequestingStats && countViews === 0 && <NoViewsPlaceholder /> }

				<StatsFirstView />

				<HeaderCake onClick={ this.goBack }>
					{ title }
				</HeaderCake>

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
			</Main>
		);
	}
}

const connectComponent = connect(
	( state, { postId } ) => {
		const siteId = getSelectedSiteId( state );

		return {
			post: getSitePost( state, siteId, postId ),
			isRequestingPost: isRequestingSitePost( state, siteId, postId ),
			countViews: getPostStat( state, siteId, postId, 'views' ),
			isRequestingStats: isRequestingPostStats( state, siteId, postId ),
			siteId,
		};
	}
);

export default flowRight(
	connectComponent,
	localize,
)( StatsPostDetail );
