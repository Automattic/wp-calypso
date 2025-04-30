import { Card } from '@automattic/components';
import { formatNumber } from '@automattic/number-formatters';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import { get, flowRight } from 'lodash';
import { Component } from 'react';
import { connect } from 'react-redux';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import Pagination from 'calypso/components/pagination';
import SectionHeader from 'calypso/components/section-header';
import {
	isRequestingSiteStatsForQuery,
	getSiteStatsNormalizedData,
	hasSiteStatsQueryFailed,
} from 'calypso/state/stats/lists/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import ErrorPanel from '../stats-error';
import StatsList from '../stats-list';
import StatsListLegend from '../stats-list/legend';
import StatsModulePlaceholder from '../stats-module/placeholder';

class StatModuleFollowersPage extends Component {
	render() {
		const {
			data,
			hasError,
			page,
			pageClick,
			query,
			perPage,
			requestingFollowers,
			siteId,
			translate,
		} = this.props;
		const noData = ! get( data, 'posts' );
		const isLoading = requestingFollowers && noData;
		const classes = [
			'stats-module',
			'summary',
			'is-followers-page',
			{
				'is-loading': isLoading,
				'has-no-data': noData,
				'is-showing-error': hasError || noData,
			},
		];

		const total = get( data, 'total' );

		let paginationSummary;
		if ( total ) {
			const startIndex = perPage * ( page - 1 ) + 1;
			let endIndex = perPage * page;
			if ( endIndex > total ) {
				endIndex = total;
			}

			paginationSummary = translate(
				'Showing %(startIndex)s - %(endIndex)s of %(total)s %(itemType)s subscribers',
				{
					context: 'pagination',
					comment:
						'"Showing [start index] - [end index] of [total] [item]" Example: Showing 21 - 40 of 300 WordPress.com subscribers',
					args: {
						startIndex: formatNumber( startIndex ),
						endIndex: formatNumber( endIndex ),
						total: formatNumber( total ),
						itemType: translate( 'Comments' ),
					},
				}
			);

			paginationSummary = (
				<div className="module-content-text module-content-text-stat">
					<p>{ paginationSummary }</p>
				</div>
			);
		}

		const pagination = (
			<Pagination page={ page } perPage={ perPage } total={ total } pageClick={ pageClick } />
		);

		let followers;
		let labelLegend;
		let valueLegend;
		if ( data && data.posts ) {
			followers = <StatsList data={ data.posts } moduleName="Followers" />;
			labelLegend = translate( 'Post', {
				context: 'noun',
			} );
			valueLegend = translate( 'Subscribers' );
		} else if ( data && data.subscribers ) {
			followers = <StatsList data={ data.subscribers } moduleName="Followers" />;
			labelLegend = translate( 'Subscriber' );
			valueLegend = translate( 'Since' );
		}
		return (
			<div className="followers">
				<QuerySiteStats statType="statsCommentFollowers" siteId={ siteId } query={ query } />
				<SectionHeader label={ translate( 'Comments Subscribers' ) } />
				<Card className={ clsx( classes ) }>
					<div className="module-content">
						{ noData && ! hasError && ! isLoading && (
							<ErrorPanel className="is-empty-message" message={ translate( 'No subscribers' ) } />
						) }

						{ paginationSummary }

						{ pagination }

						<StatsListLegend value={ valueLegend } label={ labelLegend } />

						{ followers }

						{ hasError ? <ErrorPanel className="network-error" /> : null }

						<StatsModulePlaceholder isLoading={ isLoading } />

						{ pagination }
					</div>
				</Card>
			</div>
		);
	}
}

const connectComponent = connect( ( state, { page, perPage } ) => {
	const query = {
		max: perPage,
		page,
	};
	const siteId = getSelectedSiteId( state );

	return {
		requestingFollowers: isRequestingSiteStatsForQuery(
			state,
			siteId,
			'statsCommentFollowers',
			query
		),
		data: getSiteStatsNormalizedData( state, siteId, 'statsCommentFollowers', query ),
		hasError: hasSiteStatsQueryFailed( state, siteId, 'statsCommentFollowers', query ),
		query,
		siteId,
	};
} );

export default flowRight( connectComponent, localize )( StatModuleFollowersPage );
