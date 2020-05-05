/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { numberFormat, useTranslate } from 'i18n-calypso';
import { Card } from '@automattic/components';

/**
 * Internal dependencies
 */
import CardHeading from 'components/card-heading';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { getSiteStatsNormalizedData } from 'state/stats/lists/selectors';
import QuerySiteStats from 'components/data/query-site-stats';

/**
 * Style dependencies
 */
import './style.scss';

export const Stats = ( {
	insightsData,
	insightsStatsQuery,
	insightsStatsType,
	showInsights,
	siteId,
	siteSlug,
	trafficData,
	trafficStatsType,
	trafficStatsQuery,
} ) => {
	const translate = useTranslate();

	return (
		<>
			<Card className="stats">
				{ siteId && (
					<>
						<QuerySiteStats
							siteId={ siteId }
							statType={ trafficStatsType }
							query={ trafficStatsQuery }
						/>
						{ showInsights && (
							<QuerySiteStats
								siteId={ siteId }
								statType={ insightsStatsType }
								query={ insightsStatsQuery }
							/>
						) }
					</>
				) }
				<CardHeading>{ translate( 'Stats at a glance' ) }</CardHeading>
				<h6 className="stats__subheader customer-home__card-subheader">
					{ translate( 'Your site in the last week.' ) }
				</h6>
				<div className="stats__data">
					{ ! showInsights && (
						<>
							<div className="stats__data-item">
								<div className="stats__data-value">
									{ trafficData?.views ? numberFormat( trafficData.views ) : '-' }
								</div>
								<div className="stats__data-label">{ translate( 'Views' ) }</div>
							</div>
							<div className="stats__data-item">
								<div className="stats__data-value">
									{ trafficData?.visitors ? numberFormat( trafficData.visitors ) : '-' }
								</div>
								<div className="stats__data-label">{ translate( 'Visitors' ) }</div>
							</div>
						</>
					) }
					{ showInsights && (
						<>
							<div className="stats__data-item">
								<div className="stats__data-value">{ insightsData?.day ?? '-' }</div>
								<div className="stats__data-label">{ translate( 'Most popular day' ) }</div>
							</div>
							<div className="stats__data-item">
								<div className="stats__data-value">{ insightsData?.hour ?? '-' }</div>
								<div className="stats__data-label">{ translate( 'Most popular hour' ) }</div>
							</div>
						</>
					) }
				</div>
				<a href={ `/stats/day/${ siteSlug }` }>{ translate( 'See all stats' ) }</a>
			</Card>
		</>
	);
};

const mapStateToProps = ( state ) => {
	const siteId = getSelectedSiteId( state );
	const siteSlug = getSelectedSiteSlug( state );

	const trafficStatsType = 'statsVisits';
	const trafficStatsQuery = {
		unit: 'week',
		quantity: 1,
		stat_fields: 'views,visitors',
	};
	const trafficStats = getSiteStatsNormalizedData(
		state,
		siteId,
		trafficStatsType,
		trafficStatsQuery
	);
	const trafficData = trafficStats && trafficStats.length ? trafficStats[ 0 ] : null;

	const showInsights = trafficData && trafficData.views < 10;

	const insightsStatsType = 'statsInsights';
	const insightsStatsQuery = {};
	const insightsData = getSiteStatsNormalizedData(
		state,
		siteId,
		insightsStatsType,
		insightsStatsQuery
	);

	return {
		insightsData,
		insightsStatsQuery,
		insightsStatsType,
		showInsights,
		siteId,
		siteSlug,
		trafficData,
		trafficStatsQuery,
		trafficStatsType,
	};
};

export default connect( mapStateToProps )( Stats );
