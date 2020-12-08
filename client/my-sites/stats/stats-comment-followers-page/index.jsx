/**
 * External dependencies
 */

import React, { Component } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get, flowRight } from 'lodash';

/**
 * Internal dependencies
 */
import StatsList from '../stats-list';
import StatsListLegend from '../stats-list/legend';
import StatsModulePlaceholder from '../stats-module/placeholder';
import ErrorPanel from '../stats-error';
import Pagination from 'calypso/components/pagination';
import { Card } from '@automattic/components';
import SectionHeader from 'calypso/components/section-header';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import {
	isRequestingSiteStatsForQuery,
	getSiteStatsNormalizedData,
	hasSiteStatsQueryFailed,
} from 'calypso/state/stats/lists/selectors';

class StatModuleFollowersPage extends Component {
	render() {
		const {
			data,
			followList,
			hasError,
			numberFormat,
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
				'Showing %(startIndex)s - %(endIndex)s of %(total)s %(itemType)s followers',
				{
					context: 'pagination',
					comment:
						'"Showing [start index] - [end index] of [total] [item]" Example: Showing 21 - 40 of 300 WordPress.com followers',
					args: {
						startIndex: numberFormat( startIndex ),
						endIndex: numberFormat( endIndex ),
						total: numberFormat( total ),
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
			valueLegend = translate( 'Followers' );
		} else if ( data && data.subscribers ) {
			followers = (
				<StatsList data={ data.subscribers } followList={ followList } moduleName="Followers" />
			);
			labelLegend = translate( 'Follower' );
			valueLegend = translate( 'Since' );
		}
		return (
			<div className="followers">
				<QuerySiteStats statType="statsCommentFollowers" siteId={ siteId } query={ query } />
				<SectionHeader label={ translate( 'Comments Followers' ) } />
				<Card className={ classNames( classes ) }>
					<div className="module-content">
						{ noData && ! hasError && ! isLoading && (
							<ErrorPanel className="is-empty-message" message={ translate( 'No followers' ) } />
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
