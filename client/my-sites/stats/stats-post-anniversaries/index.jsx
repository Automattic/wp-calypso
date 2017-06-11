/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import { localize, moment } from 'i18n-calypso';
import { connect } from 'react-redux';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import ErrorPanel from '../stats-error';
import StatsList from '../stats-list';
import StatsListLegend from '../stats-list/legend';
import SectionHeader from 'components/section-header';
import StatsContentText from '../stats-module/content-text';
import StatsModulePlaceholder from '../stats-module/placeholder';
import Card from 'components/card';
import QueryPosts from 'components/data/query-posts';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSitePostsForQuery, isRequestingSitePostsForQuery } from 'state/posts/selectors';

// Maximum number of simultaneous queries to fetch the posts by year
const MAX_POST_QUERIES = 10;

const StatModulePostAnniversaries = props => {
	const { oldestPostQuery, postsByYearQueries, postsByYear, requesting, siteId, translate } = props;

	const allPosts = Array.prototype.concat( ...postsByYear );

	const cardClasses = classNames( 'stats-module', 'is-expanded', 'summary', {
		'is-loading': requesting,
		'has-no-data': ! allPosts.length,
		'is-showing-error': ! allPosts.length,
	} );

	return (
		<div>
			<SectionHeader
				label={ translate( 'Anniversaries', {
					comment: 'Title of the anniversaries module',
				} ) }
			/>
			<Card className={ cardClasses }>
				{ siteId && <QueryPosts siteId={ siteId } query={ oldestPostQuery } /> }
				{ siteId &&
					postsByYearQueries.map(
						( query, i ) => <QueryPosts key={ i } siteId={ siteId } query={ query } />,
					) }

				<StatsModulePlaceholder isLoading={ requesting } />

				{ ! requesting &&
					allPosts &&
					( allPosts.length === 0
						? <EmptyMessage />
						: <PostsList allPosts={ allPosts } postsByYear={ postsByYear } /> ) }
			</Card>
		</div>
	);
};

const CalendarIcon = () => (
	<span style={ { position: 'relative', top: '-2px' } }>
		<Gridicon icon="calendar" size={ 18 } />
	</span>
);

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
				<CalendarIcon />
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

const EmptyMessage = localize( ( { translate } ) => (
	<ErrorPanel
		message={ translate( 'No anniversaries today!', {
			comment: 'Label displayed when the anniversaries module is empty',
		} ) }
	/>
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

		const requestingOldestPost = isRequestingSitePostsForQuery( state, siteId, oldestPostQuery );
		const oldestPostResult = getSitePostsForQuery( state, siteId, oldestPostQuery );
		const oldestPost = oldestPostResult && oldestPostResult[ 0 ];

		// After having received the oldest post date, an array of queries is
		// created: one for each year preceding the current year.
		if ( ! postsByYearQueries.length && oldestPost && oldestPost.date ) {
			const years = Math.min(
				MAX_POST_QUERIES,
				moment().diff( moment( oldestPost.date ), 'years' ) + 1,
			);
			postsByYearQueries = [ ...Array( years ) ].map( ( v, i ) => yearsAgoQuery( i + 1 ) );
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

		// True if any of the requests is active
		const requestingAnyPostsByYear = postsByYearQueries.some(
			query => isRequestingSitePostsForQuery( state, siteId, query ),
		);

		return {
			siteId,
			requesting: requestingOldestPost || requestingAnyPostsByYear,
			oldestPostQuery,
			oldestPost,
			postsByYearQueries,
			postsByYear,
		};
	};

	return mapStateToProps;
} )( localize( StatModulePostAnniversaries ) );
