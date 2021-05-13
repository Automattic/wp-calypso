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
import SectionHeader from 'calypso/components/section-header';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import {
	isRequestingSiteStatsForQuery,
	getSiteStatsNormalizedData,
	hasSiteStatsQueryFailed,
} from 'calypso/state/stats/lists/selectors';
import { useTranslate } from 'i18n-calypso';

const StatShares = ( { siteId } ) => {
	const translate = useTranslate();
	const isLoading = useSelector( ( state ) =>
		isRequestingSiteStatsForQuery( state, siteId, 'stats' )
	);
	const hasError = useSelector( ( state ) => hasSiteStatsQueryFailed( state, siteId, 'stats' ) );
	const {
		shares,
		sharesFacebook,
		sharesPressThis,
		sharesTwitter,
		sharesTumblr,
		sharesLinkedin,
		sharesEmail,
	} = useSelector( ( state ) => getSiteStatsNormalizedData( state, siteId, 'stats' ) ) || {};

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
			<SectionHeader label={ translate( 'Shares' ) } />
			<Card className={ classNames( ...classes ) }>
				<StatsTabs borderless>
					<StatsTab
						gridicon="share"
						label={ translate( 'Total' ) }
						loading={ isLoading }
						value={ shares }
						compact
					/>
					{ !! sharesFacebook && (
						<StatsTab
							gridicon="facebook"
							label={ translate( 'Facebook' ) }
							loading={ isLoading }
							value={ sharesFacebook }
							compact
						/>
					) }
					{ !! sharesTwitter && (
						<StatsTab
							gridicon="twitter"
							label={ translate( 'Twitter' ) }
							loading={ isLoading }
							value={ sharesTwitter }
							compact
						/>
					) }
					{ !! sharesTumblr && (
						<StatsTab
							gridicon="tumblr"
							label={ translate( 'Tumblr' ) }
							loading={ isLoading }
							value={ sharesTumblr }
							compact
						/>
					) }
					{ !! sharesLinkedin && (
						<StatsTab
							gridicon="linkedin"
							label={ translate( 'LinkedIn' ) }
							loading={ isLoading }
							value={ sharesLinkedin }
							compact
						/>
					) }
					{ !! sharesEmail && (
						<StatsTab
							gridicon="email"
							label={ translate( 'Email' ) }
							loading={ isLoading }
							value={ sharesEmail }
							compact
						/>
					) }
					{ !! sharesPressThis && (
						<StatsTab
							gridicon="pressthis"
							label={ translate( 'Press This' ) }
							loading={ isLoading }
							value={ sharesPressThis }
							compact
						/>
					) }
				</StatsTabs>
			</Card>
		</div>
	);
};

export default StatShares;
