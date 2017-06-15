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
import React from 'react';
import { localize, moment } from 'i18n-calypso';
import { connect } from 'react-redux';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import StatsList from '../stats-list';
import StatsListLegend from '../stats-list/legend';
import SectionHeader from 'components/section-header';
import StatsContentText from '../stats-module/content-text';
import Card from 'components/card';
import QueryPosts from 'components/data/query-posts';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSitePostsForQuery } from 'state/posts/selectors';

// Maximum number of simultaneous queries to fetch the posts by year
const MAX_POST_QUERIES = 10;

const StatModulePostAnniversaries = props => {
	const { oldestPostQuery, postsByYearQueries, postsByYear, siteId, translate } = props;

	if ( ! siteId ) {
		return null;
	}

	const allPosts = Array.prototype.concat( ...postsByYear );

	return (
		<div>
			{ <QueryPosts siteId={ siteId } query={ oldestPostQuery } /> }
			{ postsByYearQueries.map(
				( query, i ) => <QueryPosts key={ i } siteId={ siteId } query={ query } />,
			) }
			{ ! allPosts.length
				? null
				: <div>
						<SectionHeader
							label={ translate(
								'Anniversaries',
								{ comment: 'Title of the anniversaries module' },
							) }
						/>
						<Card className="stats-post-anniversaries__card stats-module">
							<PostsList allPosts={ allPosts } postsByYear={ postsByYear } />
						</Card>
					</div> }
		</div>
	);
};

const PostsList = ( { allPosts, postsByYear } ) =>
	( allPosts.length === 1
		? <SinglePost post={ allPosts[ 0 ] } />
		: <GroupedPosts postsByYear={ postsByYear } /> );

const SinglePost = localize( ( { translate, post } ) => {
	const yearsAgo = moment()
		.startOf( 'year' )
		.diff( moment( post.date ).startOf( 'year' ), 'years' );
	return (
		<StatsContentText>
			<p>
				<Gridicon icon="calendar" size={ 18 } />
				{ translate(
					'%(yearsAgo)d year ago on this day, {{href}}%(title)s{{/href}} was published.',
					'%(yearsAgo)d years ago on this day, {{href}}%(title)s{{/href}} was published.',
					{
						count: yearsAgo,
						args: { yearsAgo, title: post.title },
						components: {
							href: <a href={ post.URL } target="_blank" rel="noopener noreferrer" />,
						},
						comment: 'Sentence showing what post was published some years ago',
					},
				) }
			</p>
		</StatsContentText>
	);
} );

const GroupedPosts = localize( ( { translate, postsByYear } ) => (
	<div>
		<StatsContentText>
			<p>
				{ translate( 'Published on this day in the past years:', {
					comment: 'Sentence preceding a list of posts published in the previous years',
				} ) }
			</p>
		</StatsContentText>
		<StatsListLegend label={ translate( 'Post' ) } value={ translate( 'Year' ) } />
		<StatsList
			moduleName={ 'postAnniversaries' }
			data={ postsByYear.reduce(
				( allPosts, posts, i ) =>
					allPosts.concat(
						posts.map( post => ( {
							link: post.URL,
							label: post.title,
							labelIcon: 'calendar',
							value: {
								type: 'raw',
								value: moment().subtract( i + 1, 'years' ).format( 'YYYY' ),
							},
						} ) ),
					),
				[],
			) }
		/>

	</div>
) );

const yearsAgoToday = ( years = 1, nextDay = false ) =>
	moment().startOf( 'day' ).subtract( years, 'years' ).add( nextDay ? 1 : 0, 'day' );

const yearsAgoQuery = ( yearsAgo = 1 ) => ( {
	after: yearsAgoToday( yearsAgo ).format(),
	before: yearsAgoToday( yearsAgo, true ).format(),
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
	 * which would trigger a re-rendering of the component as we need to pass
	 * them to it.
	 */
	let postsByYear = [];
	let postsByYearQueries = [];

	const oldestPostQuery = { number: 1, order: 'ASC' };

	const mapStateToProps = state => {
		const siteId = getSelectedSiteId( state );

		const oldestPostResult = getSitePostsForQuery( state, siteId, oldestPostQuery );
		const oldestPost = oldestPostResult && oldestPostResult[ 0 ];

		/* After having received the oldest post date, an array of queries is
		 * created: one for each year preceding the current year.
		 *
		 * Things to note here:
		 *  - The third argument of the diff() method is set to true to get a
		 *    floating point instead of a rounded number.
		 *  - The method call startOf('day') is used to get the difference using
		 *    days only.
		 *  - Math.floor() is used to get the amount of years as an integer.
		 */
		if ( ! postsByYearQueries.length && oldestPost && oldestPost.date ) {
			const years = Math.floor(
				Math.min(
					MAX_POST_QUERIES,
					moment()
						.startOf( 'day' )
						.diff( moment( oldestPost.date ).startOf( 'day' ), 'years', true ),
				),
			);
			if ( years > 0 ) {
				postsByYearQueries = [ ...Array( years ) ].map( ( v, i ) => yearsAgoQuery( i + 1 ) );
			}
		}

		// Fill postsByYear if any item has been updated
		postsByYearQueries.forEach( ( query, i ) => {
			const result = getSitePostsForQuery( state, siteId, query );

			// Create a new array when an item is updated, to invalidate the equality check
			if ( postsByYear[ i ] !== result ) {
				postsByYear[ i ] = result || [];
				postsByYear = [ ...postsByYear ];
			}
		} );

		return {
			siteId,
			oldestPostQuery,
			postsByYearQueries,
			postsByYear,
		};
	};

	return mapStateToProps;
} )( localize( StatModulePostAnniversaries ) );
