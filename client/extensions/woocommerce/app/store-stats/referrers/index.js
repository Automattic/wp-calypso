/** @format */

/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { find } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import QuerySiteStats from 'components/data/query-site-stats';
import { getSiteStatsNormalizedData } from 'state/stats/lists/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { getUnitPeriod } from 'woocommerce/app/store-stats/utils';
import StoreStatsPeriodNav from 'woocommerce/app/store-stats/store-stats-period-nav';
import JetpackColophon from 'components/jetpack-colophon';
import Main from 'components/main';
import Module from 'woocommerce/app/store-stats/store-stats-module';
import { sortBySales } from './helpers';

const STAT_TYPE = 'statsStoreReferrers';

const Referrers = ( { siteId, query, data, selectedDate, unit, slug, translate } ) => {
	const unitSelectedDate = getUnitPeriod( selectedDate, unit );
	const selectedData = find( data, d => d.date === unitSelectedDate ) || { data: [] };
	const sortedData = sortBySales( selectedData.data );
	return (
		<Main wideLayout>
			{ siteId && <QuerySiteStats statType={ STAT_TYPE } siteId={ siteId } query={ query } /> }
			<StoreStatsPeriodNav
				type="referrers"
				selectedDate={ selectedDate }
				unit={ unit }
				slug={ slug }
				query={ query }
				statType={ STAT_TYPE }
				title={ translate( 'Store Referrers' ) }
			/>
			<Module
				siteId={ siteId }
				emptyMessage={ translate( 'No referrers found' ) }
				query={ query }
				statType={ STAT_TYPE }
			>
				<table>
					<tbody>
						{ sortedData.map( d => (
							<tr key={ d.referrer }>
								<td>{ d.date }</td>
								<td>{ d.referrer }</td>
								<td>{ d.product_views }</td>
								<td>{ d.add_to_carts }</td>
								<td>{ d.product_purchases }</td>
								<td>${ d.sales }</td>
							</tr>
						) ) }
					</tbody>
				</table>
			</Module>
			<JetpackColophon />
		</Main>
	);
};

Referrers.propTypes = {
	siteId: PropTypes.number,
	query: PropTypes.object.isRequired,
	data: PropTypes.array.isRequired,
	selectedDate: PropTypes.string,
	unit: PropTypes.oneOf( [ 'day', 'week', 'month', 'year' ] ),
	slug: PropTypes.string,
};

export default connect( ( state, { query } ) => {
	const siteId = getSelectedSiteId( state );
	return {
		slug: getSelectedSiteSlug( state ),
		siteId,
		data: getSiteStatsNormalizedData( state, siteId, STAT_TYPE, query ),
	};
} )( localize( Referrers ) );
