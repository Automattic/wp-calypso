/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import { Card } from '@automattic/components';

/**
 * Internal dependencies
 */
import CardHeading from 'components/card-heading';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { isJetpackModuleActive, isJetpackSite } from 'state/sites/selectors';
import { getSiteStatsNormalizedData } from 'state/stats/lists/selectors';
import QuerySiteStats from 'components/data/query-site-stats';

/**
 * Style dependencies
 */
import './style.scss';

export const StatsCard = ( {
	areStatsEnabled,
	siteId,
	siteSlug,
	trafficData,
	trafficStatsQuery,
	trafficStatsType,
} ) => {
	const translate = useTranslate();

	if ( ! areStatsEnabled ) {
		return null;
	}

	return (
		<Card className="stats-card">
			{ siteId && (
				<QuerySiteStats
					siteId={ siteId }
					statType={ trafficStatsType }
					query={ trafficStatsQuery }
				/>
			) }
			<CardHeading>{ translate( 'Stats at a glance' ) }</CardHeading>
			<h6 className="stats-card__subheader">{ translate( 'Your site in the last week.' ) }</h6>
			<div className="stats-card__visits">
				<div className="stats-card__count">
					<div className="stats-card__count-value">{ trafficData?.views ?? '-' }</div>
					<div className="stats-card__count-label">{ translate( 'Views' ) }</div>
				</div>
				<div className="stats-card__count">
					<div className="stats-card__count-value">{ trafficData?.visitors ?? '-' }</div>
					<div className="stats-card__count-label">{ translate( 'Visitors' ) }</div>
				</div>
			</div>
			<a href={ `/stats/day/${ siteSlug }` }>{ translate( 'See all stats' ) }</a>
		</Card>
	);
};

const mapStateToProps = state => {
	const siteId = getSelectedSiteId( state );
	const siteSlug = getSelectedSiteSlug( state );
	const isJetpack = isJetpackSite( state, siteId );
	const isStatsModuleActive = isJetpackModuleActive( state, siteId, 'stats' );
	const areStatsEnabled = ! isJetpack || isStatsModuleActive;

	const trafficStatsQuery = {
		unit: 'week',
		quantity: 1,
		stat_fields: 'views,visitors',
	};
	const trafficStatsType = 'statsVisits';
	const trafficStats = getSiteStatsNormalizedData(
		state,
		siteId,
		trafficStatsType,
		trafficStatsQuery
	);
	const trafficData = trafficStats && trafficStats.length ? trafficStats[ 0 ] : null;

	return {
		areStatsEnabled,
		siteId,
		siteSlug,
		trafficData,
		trafficStatsQuery,
		trafficStatsType,
	};
};

export default connect( mapStateToProps )( StatsCard );
