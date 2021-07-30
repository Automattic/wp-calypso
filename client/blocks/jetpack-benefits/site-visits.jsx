/**
 * External Dependencies
 */
import React from 'react';
import { useSelector } from 'react-redux';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import {
	getSiteStatsNormalizedData,
	isRequestingSiteStatsForQuery,
} from 'calypso/state/stats/lists/selectors';

/**
 * Internal Dependencies
 */
import memoizeLast from 'calypso/lib/memoize-last';
import moment from 'moment';
import { JetpackBenefitsCard } from 'calypso/blocks/jetpack-benefits/benefit-card';
import { useTranslate } from 'i18n-calypso';

const memoizedQuery = memoizeLast( ( period, unit, quantity, endOf ) => ( {
	period,
	unit: unit,
	quantity: quantity,
	date: endOf,
} ) );

const JetpackBenefitsSiteVisits = ( props ) => {
	const { siteId, statType, query } = props;
	const translate = useTranslate();

	const isRequestingStats = useSelector( ( state ) => {
		return isRequestingSiteStatsForQuery( state, siteId, statType, query );
	} );

	const data = useSelector( ( state ) => {
		return getSiteStatsNormalizedData( state, siteId, statType, query );
	} );

	if ( isRequestingStats ) {
		return (
			<JetpackBenefitsCard
				headline={ translate( 'Site Stats' ) }
				stat={ translate( 'Loading' ) }
				description={ translate( 'Getting visitors stat' ) }
				placeholder={ true }
			/>
		);
	}

	let countVisits = 0;
	data.map( ( monthPeriod ) => {
		countVisits += monthPeriod.views;
	} );

	return (
		<React.Fragment>
			<JetpackBenefitsCard
				headline={ translate( 'Site Stats' ) }
				stat={ countVisits > 0 ? countVisits : null }
				description={
					countVisits > 0
						? translate( 'Visitors to your site tracked by Jetpack in the last year.' )
						: translate( 'Jetpack provides stats about your site' )
				}
			/>
		</React.Fragment>
	);
};

export default ( props ) => {
	const { siteId } = props;
	const today = moment().locale( 'en' );
	const statType = 'statsVisits';
	const period = 'year';
	const query = memoizedQuery( period, 'month', 12, today.format( 'YYYY-MM-DD' ) );

	return (
		<>
			<QuerySiteStats siteId={ siteId } statType={ statType } query={ query } />
			<JetpackBenefitsSiteVisits statType={ statType } query={ query } { ...props } />
		</>
	);
};
