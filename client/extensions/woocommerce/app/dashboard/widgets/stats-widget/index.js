/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import config from 'config';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { find } from 'lodash';
import moment from 'moment';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import { withLocalizedMoment } from 'components/localized-moment';
import { dashboardListLimit } from 'woocommerce/app/store-stats/constants';
import DashboardWidget from 'woocommerce/components/dashboard-widget';
import { getLink } from 'woocommerce/lib/nav-utils';
import { getPreference } from 'state/preferences/selectors';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import { getSiteStatsNormalizedData } from 'state/stats/lists/selectors';
import {
	getUnitPeriod,
	getStartPeriod,
	getDelta,
	getDeltaFromData,
	getEndPeriod,
	getConversionRateData,
	getQueries,
} from 'woocommerce/app/store-stats/utils';
import List from './list';
import QueryPreferences from 'components/data/query-preferences';
import QuerySiteStats from 'components/data/query-site-stats';
import { recordTrack } from 'woocommerce/lib/analytics';
import { savePreference } from 'state/preferences/actions';
import SelectDropdown from 'components/select-dropdown';
import { sortBySales } from 'woocommerce/app/store-stats/referrers/helpers';
import Stat from './stat';
import { withAnalytics } from 'state/analytics/actions';

class StatsWidget extends Component {
	static propTypes = {
		site: PropTypes.shape( {
			name: PropTypes.string.isRequired,
			slug: PropTypes.string.isRequired,
		} ),
		unit: PropTypes.string,
		queries: PropTypes.object,
		orderData: PropTypes.object,
		referrerData: PropTypes.array,
		topEarnersData: PropTypes.array,
		visitorData: PropTypes.array,
		productData: PropTypes.array,
		saveDashboardUnit: PropTypes.func,
		viewStats: PropTypes.func,
	};

	handleTimePeriodChange = ( option ) => {
		const { saveDashboardUnit } = this.props;
		saveDashboardUnit( option.value );
	};

	dateForDisplay = () => {
		const { translate, unit, moment: localizedMoment } = this.props;

		const localizedDate = localizedMoment( localizedMoment().format( 'YYYY-MM-DD' ) );
		let formattedDate;
		switch ( unit ) {
			case 'week':
				formattedDate = translate( '%(startDate)s - %(endDate)s', {
					context: 'Date range for which stats are being displayed',
					args: {
						// LL is a date localized by momentjs
						startDate: localizedDate.startOf( 'week' ).add( 1, 'd' ).format( 'LL' ),
						endDate: localizedDate.endOf( 'week' ).add( 1, 'd' ).format( 'LL' ),
					},
				} );
				break;

			case 'month':
				formattedDate = localizedDate.format( 'MMMM YYYY' );
				break;

			case 'year':
				formattedDate = localizedDate.format( 'YYYY' );
				break;

			default:
				// LL is a date localized by momentjs
				formattedDate = localizedDate.format( 'LL' );
		}

		return formattedDate;
	};

	renderTitle = () => {
		const { site, translate, unit } = this.props;

		const options = [
			{ value: 'day', label: translate( 'day' ) },
			{ value: 'week', label: translate( 'week' ) },
			{ value: 'month', label: translate( 'month' ) },
		];

		const dateDisplay = this.dateForDisplay();

		return (
			<Fragment>
				<span>
					{ translate( '%(siteName)s in the last {{timePeriod/}}', {
						args: { siteName: site.name },
						components: {
							timePeriod: (
								<SelectDropdown
									options={ options }
									initialSelected={ unit }
									onSelect={ this.handleTimePeriodChange }
								/>
							),
						},
						context:
							'Store stats dashboard widget title. Example: "Your Site in the last day|week|month.".',
					} ) }
				</span>
				<p>{ dateDisplay }</p>
			</Fragment>
		);
	};

	renderOrders = () => {
		const { site, translate, unit, orderData, queries, moment: localizedMoment } = this.props;
		const date = getEndPeriod( localizedMoment().format( 'YYYY-MM-DD' ), unit );
		const delta = getDelta( orderData.deltas, date, 'orders' );
		return (
			<Stat
				site={ site }
				label={ translate( 'Orders' ) }
				statType="statsOrders"
				attribute="orders"
				query={ queries.orderQuery }
				data={ ( orderData && orderData.data ) || [] }
				delta={ delta }
				date={ date }
				unit={ unit }
				type="number"
			/>
		);
	};

	renderSales = () => {
		const { site, translate, unit, orderData, queries, moment: localizedMoment } = this.props;
		const date = getEndPeriod( localizedMoment().format( 'YYYY-MM-DD' ), unit );
		const delta = getDelta( orderData.deltas, date, 'total_sales' );
		return (
			<Stat
				site={ site }
				label={ translate( 'Sales' ) }
				statType="statsOrders"
				query={ queries.orderQuery }
				attribute="total_sales"
				data={ ( orderData && orderData.data ) || [] }
				delta={ delta }
				date={ date }
				unit={ unit }
				type="currency"
			/>
		);
	};

	renderVisitors = () => {
		const { site, translate, unit, visitorData, queries, moment: localizedMoment } = this.props;
		const date = getStartPeriod( localizedMoment().format( 'YYYY-MM-DD' ), unit );
		const delta = getDeltaFromData( visitorData, date, 'visitors', unit );
		return (
			<Stat
				site={ site }
				label={ translate( 'Visitors' ) }
				data={ visitorData || [] }
				delta={ delta }
				date={ date }
				unit={ unit }
				statType="statsVisits"
				query={ queries.visitorQuery }
				attribute="visitors"
				type="number"
			/>
		);
	};

	renderConversionRate = () => {
		const {
			site,
			translate,
			unit,
			visitorData,
			orderData,
			queries,
			moment: localizedMoment,
		} = this.props;
		const date = getUnitPeriod( localizedMoment().format( 'YYYY-MM-DD' ), unit );
		const data = getConversionRateData( visitorData, orderData.data, unit );
		const delta = getDeltaFromData( data, date, 'conversionRate', unit );
		return (
			<Stat
				site={ site }
				label={ translate( 'Conversion rate' ) }
				labelToolTip={ translate( 'Number of orders by unique visitors', {
					context: 'Conversion rate tooltip',
				} ) }
				data={ data || [] }
				delta={ delta }
				date={ date }
				unit={ unit }
				statType="statsOrders"
				query={ queries.orderQuery }
				attribute="conversionRate"
				type="percent"
			/>
		);
	};

	renderReferrers = () => {
		const { site, translate, unit, referrerData, queries, viewStats } = this.props;
		const { referrerQuery } = queries;

		const selectedData = find( referrerData, ( d ) => d.date === referrerQuery.date ) || {
			data: [],
		};
		const sortedData = sortBySales( selectedData.data, dashboardListLimit );

		const values = [
			{ key: 'referrer', title: translate( 'Referrer' ), format: 'text' },
			{ key: 'product_views', title: translate( 'Referrals' ), format: 'text' },
			{ key: 'sales', title: translate( 'Sales' ), format: 'currency' },
		];

		const emptyMessage =
			'day' === unit
				? translate(
						'Data is being processed. Switch to the week or month view to see your latest referrers.'
				  )
				: translate( 'No referral activity has been recorded for this time period.' );

		const viewLink = config.isEnabled( 'woocommerce/extension-referrers' )
			? getLink( `/store/stats/referrers/${ unit }/:site`, site )
			: '';

		return (
			<List
				site={ site }
				statType="statsStoreReferrers"
				unit={ unit }
				values={ values }
				query={ referrerQuery }
				viewText={ translate( 'View referrers' ) }
				viewLink={ viewLink }
				onViewClick={ viewStats }
				fetchedData={ sortedData }
				emptyMessage={ emptyMessage }
			/>
		);
	};

	renderProducts = () => {
		const { site, translate, unit, topEarnersData, queries, viewStats } = this.props;
		const { topListQuery } = queries;
		const values = [
			{ key: 'name', title: translate( 'Product' ), format: 'text' },
			{ key: 'total', title: translate( 'Sales' ), format: 'currency' },
		];

		return (
			<List
				site={ site }
				statType="statsTopEarners"
				unit={ unit }
				values={ values }
				query={ topListQuery }
				fetchedData={ topEarnersData }
				viewText={ translate( 'View top products' ) }
				viewLink={ getLink( `/store/stats/products/${ unit }/:site`, site ) }
				onViewClick={ viewStats }
				emptyMessage={ translate( 'No products have been sold in this time period.' ) }
			/>
		);
	};

	queryData = () => {
		const { site, queries } = this.props;

		if ( ! site ) {
			return null;
		}

		const { orderQuery, topListQuery, referrerQuery, visitorQuery } = queries;
		return (
			<Fragment>
				<QueryPreferences />
				<QuerySiteStats statType="statsOrders" siteId={ site.ID } query={ orderQuery } />
				<QuerySiteStats statType="statsTopEarners" siteId={ site.ID } query={ topListQuery } />
				<QuerySiteStats statType="statsStoreReferrers" siteId={ site.ID } query={ referrerQuery } />
				<QuerySiteStats statType="statsVisits" siteId={ site.ID } query={ visitorQuery } />
			</Fragment>
		);
	};

	render() {
		const { site, translate, unit } = this.props;

		const bumpStat = () => {
			this.props.viewStats( 'full' );
		};

		return (
			<div className="stats-widget">
				{ this.queryData() }
				<DashboardWidget title={ this.renderTitle() }>
					<div className="stats-widget__boxes">
						{ this.renderOrders() }
						{ this.renderSales() }
						{ this.renderVisitors() }
						{ this.renderConversionRate() }
						{ this.renderReferrers() }
						{ this.renderProducts() }
					</div>

					<div className="stats-widget__footer">
						<span>
							{ translate(
								"You can view more detailed stats and reports on your site's main dashboard."
							) }
						</span>
						<Button
							href={ getLink( `/store/stats/orders/${ unit }/:site`, site ) }
							onClick={ bumpStat }
						>
							{ translate( 'View full stats' ) }
						</Button>
					</div>
				</DashboardWidget>
			</div>
		);
	}
}

function mapStateToProps( state ) {
	const site = getSelectedSiteWithFallback( state );
	const unit = getPreference( state, 'store-dashboardStatsWidgetUnit' );

	const queries = getQueries( unit, moment().format( 'YYYY-MM-DD' ), {
		referrerQuery: { quantity: 1 },
		topListQuery: { limit: dashboardListLimit },
	} );
	const { orderQuery, topListQuery, referrerQuery, visitorQuery } = queries;

	const orderData = getSiteStatsNormalizedData( state, site.ID, 'statsOrders', orderQuery );
	const visitorData = getSiteStatsNormalizedData( state, site.ID, 'statsVisits', visitorQuery );
	const topEarnersData = getSiteStatsNormalizedData(
		state,
		site.ID,
		'statsTopEarners',
		topListQuery
	);
	const referrerData = getSiteStatsNormalizedData(
		state,
		site.ID,
		'statsStoreReferrers',
		referrerQuery
	);

	return {
		site,
		unit,
		queries,
		orderData,
		referrerData,
		topEarnersData,
		visitorData,
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			saveDashboardUnit: ( value ) => {
				recordTrack( 'calypso_woocommerce_dashboard_widget_stats_unit_change', { unit: value } );
				return savePreference( 'store-dashboardStatsWidgetUnit', value );
			},
			viewStats: ( slug ) =>
				withAnalytics(
					recordTrack( 'calypso_woocommerce_dashboard_action_click', {
						action: 'stats-widget-view-' + slug,
					} )
				),
		},
		dispatch
	);
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)( localize( withLocalizedMoment( StatsWidget ) ) );
