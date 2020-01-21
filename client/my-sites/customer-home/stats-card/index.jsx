/**
 * External dependencies
 */
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import { Card } from '@automattic/components';

/**
 * Internal dependencies
 */
import CardHeading from 'components/card-heading';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { getCountRecords } from 'state/stats/chart-tabs/selectors';
import { requestChartCounts } from 'state/stats/chart-tabs/actions';

/**
 * Style dependencies
 */
import './style.scss';

export const StatsCard = ( { siteId, siteSlug, weekViews, weekVisitors, fetchWeekVisits } ) => {
	const translate = useTranslate();

	useEffect( () => {
		fetchWeekVisits( siteId );
	}, [ siteId ] );

	return (
		<Card className="stats-card">
			<CardHeading>{ translate( 'Stats at a glance' ) }</CardHeading>
			<h6 className="stats-card__subheader">{ translate( 'Your site in the last week.' ) }</h6>
			<div className="stats-card__visits">
				<div className="stats-card__count">
					<div className="stats-card__count-value">{ weekViews ?? '-' }</div>
					<div className="stats-card__count-label">{ translate( 'Views' ) }</div>
				</div>
				<div className="stats-card__count">
					<div className="stats-card__count-value">{ weekVisitors ?? '-' }</div>
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
	const weekVisits = getCountRecords( state, siteId, 'week' );
	const weekViews = weekVisits.length ? weekVisits[ 0 ].views : null;
	const weekVisitors = weekVisits.length ? weekVisits[ 0 ].visitors : null;
	return {
		siteId,
		siteSlug,
		weekViews,
		weekVisitors,
	};
};

const mapDispatchToProps = {
	fetchWeekVisits: siteId =>
		requestChartCounts( {
			siteId,
			period: 'week',
			quantity: 1,
			statFields: [ 'views', 'visitors' ],
		} ),
};

export default connect( mapStateToProps, mapDispatchToProps )( StatsCard );
