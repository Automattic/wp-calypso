/**
 * External dependencies
 */

import React from 'react';
import { useSelector } from 'react-redux';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import StatsTabs from '../stats-tabs';
import StatsTab from '../stats-tabs/tab';
import ErrorPanel from '../stats-error';
import SectionHeader from 'calypso/components/section-header';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import QuerySharingButtons from 'calypso/components/data/query-sharing-buttons';
import getSharingButtons from 'calypso/state/selectors/get-sharing-buttons';
import {
	isRequestingSiteStatsForQuery,
	getSiteStatsForQuery,
	hasSiteStatsQueryFailed,
} from 'calypso/state/stats/lists/selectors';
import { useTranslate } from 'i18n-calypso';

const StatShares = ( { siteId } ) => {
	const translate = useTranslate();
	const isLoading = useSelector( ( state ) =>
		isRequestingSiteStatsForQuery( state, siteId, 'stats' )
	);
	const shareButtons = useSelector( ( state ) => getSharingButtons( state, siteId ) );
	const hasError = useSelector( ( state ) => hasSiteStatsQueryFailed( state, siteId, 'stats' ) );
	const siteStats = useSelector( ( state ) => getSiteStatsForQuery( state, siteId, 'stats' ) );
	const classes = [
		'stats-module',
		{
			'is-loading': isLoading,
			'is-showing-error': hasError,
		},
	];

	return (
		<div>
			{ siteId && <QuerySiteStats siteId={ siteId } statType="stats" /> }
			{ siteId && <QuerySharingButtons siteId={ siteId } /> }
			<SectionHeader label={ translate( 'Shares' ) } />
			<Card className={ classNames( ...classes ) }>
				<StatsTabs borderless>
					{ siteStats &&
						shareButtons &&
						shareButtons.map( ( service ) => {
							let count;
							if ( ( count = siteStats.stats[ 'shares_' + service.ID ] ) ) {
								return (
									<StatsTab label={ service.name } loading={ isLoading } value={ count } compact />
								);
							}
						} ) }
					{ ! isLoading && ! siteStats?.stats.shares && (
						<ErrorPanel message={ translate( 'No shares recorded' ) } />
					) }
				</StatsTabs>
			</Card>
		</div>
	);
};

export default StatShares;
