/*
 * Post Anniversaries
 *
 * This component displays the post anniversaries based on the current day.
 *
 * There is no loading or empty state: the module is only displayed if there is
 * at least one anniversary. That is the reason why this module should ideally
 * be inserted at the end of a column.
 */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize, moment } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import StatsModuleExpand from '../stats-module/expand';
import SectionHeader from 'components/section-header';
import PostsList from './posts-list';
import QueryPosts from 'components/data/query-posts';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSitePostsForQuery } from 'state/posts/selectors';
import QueryPostStats from 'components/data/query-post-stats';
import { getPostStats } from 'state/stats/posts/selectors';
import { getSiteSlug } from 'state/sites/selectors';

// Maximum number of simultaneous queries to fetch the posts by year
const MAX_POST_QUERIES = 10;

// Maximum number of posts to display
const MAX_POSTS_DISPLAYED = 3;

const PERIODS_ALLOWED = [ 'day', 'week', 'month' ];

class StatModulePostAnniversaries extends Component {
	render() {
		const {
			topPostsOnly,
			oldestPostQuery,
			postsByYearQueries,
			postsByYear,
			topPostsByYear,
			siteId,
			translate,
			summary,
			period,
		} = this.props;

		if ( ! siteId || PERIODS_ALLOWED.indexOf( period.period ) === -1 ) {
			return null;
		}

		const allPosts = Array.prototype.concat( ...postsByYear );

		let title = translate( 'Anniversaries', { comment: 'Title of the anniversaries module' } );
		if ( topPostsOnly ) {
			title = translate( 'Top %d anniversaries', {
				args: MAX_POSTS_DISPLAYED,
				comment: 'Title of the anniversaries module (when the maximum is reached)',
			} );
		}

		return (
			<div>
				{ <QueryPosts siteId={ siteId } query={ oldestPostQuery } /> }
				{ postsByYearQueries.map(
					( query, i ) => <QueryPosts key={ i } siteId={ siteId } query={ query } />,
				) }
				{ ! allPosts.length
					? null
					: <div>
							{ topPostsOnly
								? allPosts.map(
										( post, i ) => (
											<QueryPostStats key={ i } siteId={ siteId } postId={ post.ID } />
										),
									)
								: null }
							{ ! summary &&
								<SectionHeader label={ title } href={ summary ? null : this.getHref() } /> }
							<Card className="stats-post-anniversaries__card stats-module">
								{ summary &&
									<div className="stats-post-anniversaries__title stats-section-title">
										<h3>
											{ translate( 'Anniversaries for %s', { args: this.getDateForDisplay() } ) }
										</h3>
									</div> }
								<PostsList postsByYear={ topPostsByYear } summary={ summary } period={ period } />
								{ topPostsOnly && <StatsModuleExpand href={ this.getHref() } /> }
							</Card>
						</div> }
			</div>
		);
	}

	getDateForDisplay() {
		const { period, translate } = this.props;

		// Ensure we have a moment instance here to work with.
		const date = period.startOf.clone();

		if ( period.period === 'week' ) {
			return translate( '%(startDate)s - %(endDate)s', {
				context: 'Date range to represent a week',
				args: {
					// LL is a date localized by momentjs
					startDate: date.startOf( 'week' ).add( 1, 'd' ).format( 'LL' ),
					endDate: date.endOf( 'week' ).add( 1, 'd' ).format( 'LL' ),
				},
			} );
		}

		if ( period.period === 'month' ) {
			return date.format( 'MMMM YYYY' );
		}

		return date.format( 'LL' );
	}

	getHref() {
		const { period, path, siteSlug } = this.props;

		// Some modules do not have view all abilities
		if ( period && path && siteSlug ) {
			return (
				`/stats/${ period.period }/${ path }/${ siteSlug }` +
				`?startDate=${ period.startOf.format( 'YYYY-MM-DD' ) }`
			);
		}
	}
}

const yearsAgoQuery = ( startDate, endDate, yearsAgo = 1 ) => ( {
	after: startDate.clone().subtract( yearsAgo, 'years' ).format(),
	before: endDate.clone().subtract( yearsAgo, 'years' ).format(),
	status: 'publish',
} );

export default connect( () => {
	/*
	 * Keep track of the posts queries and results.
	 *
	 * This is needed because <QueryPosts /> handles one query at a time and is
	 * responsible of creating the data in the Redux store.
	 *
	 * Creating these arrays on the fly would create a new reference every time,
	 * which would trigger a re-rendering of the component because we need to
	 * pass them to it.
	 *
	 * previousPeriod is used to recreate these arrays when the period has changed.
	 */
	let postsByYear = [];
	let postsByYearQueries = [];
	let previousPeriod = null;

	const oldestPostQuery = { number: 1, order: 'ASC' };

	const mapStateToProps = ( state, props ) => {
		const siteId = getSelectedSiteId( state );
		const siteSlug = getSiteSlug( state, siteId );
		const oldestPostResult = getSitePostsForQuery( state, siteId, oldestPostQuery );
		const oldestPost = oldestPostResult && oldestPostResult[ 0 ];
		const { summary, period } = props;

		if ( period !== previousPeriod ) {
			postsByYear = [];
			postsByYearQueries = [];
			previousPeriod = period;
		}

		/* After having received the oldest post date, an array of queries is
		 * created: one for each year preceding the current year.
		 *
		 * Things to note here:
		 *  - The third argument of the diff() method is set to true to get a
		 *    floating point instead of a rounded number.
		 *  - Math.floor() is used to get the amount of years as an integer.
		 */
		if ( ! postsByYearQueries.length && oldestPost && oldestPost.date ) {
			const years = Math.floor(
				Math.min(
					MAX_POST_QUERIES,
					period.startOf.diff( moment( oldestPost.date ).startOf( 'day' ), 'years', true ),
				),
			);
			if ( years > 0 ) {
				postsByYearQueries = [ ...Array( years + 1 ) ].map(
					( v, i ) => yearsAgoQuery( period.startOf, period.endOf, i + 1 ),
				);
			}
		}

		// Fill postsByYear if any item has been updated
		postsByYearQueries.forEach( ( query, i ) => {
			const result = getSitePostsForQuery( state, siteId, query );

			// No need to update.
			if ( postsByYear[ i ] === result ) {
				return;
			}

			// Fill the year posts.
			postsByYear[ i ] = result || [];

			// A new array is created after an item is updated, to invalidate the
			// equality check and re-render the component.
			postsByYear = [ ...postsByYear ];
		} );

		// Get the number of views for each post, to get the top posts
		const allPosts = Array.prototype.concat( ...postsByYear );
		const topPostsOnly = ! summary && allPosts.length > MAX_POSTS_DISPLAYED;
		const topPosts = ! topPostsOnly
			? allPosts
			: allPosts
					.map( post => {
						const stats = getPostStats( state, siteId, post.ID );
						const views = ( stats && stats.views ) || 0;
						return [ post.ID, views, post.title ];
					} )
					.sort( ( a, b ) => b[ 1 ] - a[ 1 ] )
					.slice( 0, MAX_POSTS_DISPLAYED )
					.map( postViews => postViews[ 0 ] );

		const topPostsByYear = topPostsOnly
			? postsByYear.map( posts => posts.filter( post => topPosts.indexOf( post.ID ) > -1 ) )
			: postsByYear;

		return {
			siteId,
			oldestPostQuery,
			postsByYearQueries,
			postsByYear,
			topPostsByYear,
			topPostsOnly,
			siteSlug,
		};
	};

	return mapStateToProps;
} )( localize( StatModulePostAnniversaries ) );
