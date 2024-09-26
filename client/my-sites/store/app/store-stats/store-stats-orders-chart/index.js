import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import Tabs from 'calypso/my-sites/stats/components/stats-tabs';
import Tab from 'calypso/my-sites/stats/components/stats-tabs/tab';
import {
	getSiteStatsNormalizedData,
	isRequestingSiteStatsForQuery,
} from 'calypso/state/stats/lists/selectors';
import { getPeriodFormat } from 'calypso/state/stats/lists/utils';
import Delta from '../../../components/delta';
import { UNITS, chartTabs as tabs } from '../constants';
import StoreStatsChart from '../store-stats-chart';
import { getDelta, formatValue } from '../utils';

class StoreStatsOrdersChart extends Component {
	static propTypes = {
		data: PropTypes.array.isRequired,
		deltas: PropTypes.array.isRequired,
		isRequesting: PropTypes.bool.isRequired,
		query: PropTypes.object.isRequired,
		selectedDate: PropTypes.string.isRequired,
		siteId: PropTypes.number,
		unit: PropTypes.string.isRequired,
		slug: PropTypes.string,
	};

	renderTabs = ( { chartData, selectedIndex, selectedTabIndex, selectedDate, unit, tabClick } ) => {
		const { deltas, moment, translate } = this.props;
		return (
			<Tabs data={ chartData }>
				{ tabs.map( ( tab, tabIndex ) => {
					if ( tab.isHidden ) {
						return null;
					}

					const itemChartData = chartData[ selectedIndex ];
					const delta = getDelta( deltas, selectedDate, tab.attr );
					const deltaValue =
						delta.direction === 'is-undefined-increase'
							? '-'
							: Math.abs( Math.round( delta.percentage_change * 100 ) );

					const periodFormat = getPeriodFormat( unit, delta.reference_period );
					const value = itemChartData.data[ tab.attr ];

					return (
						<Tab
							key={ tab.attr }
							index={ tabIndex }
							label={ tab.tabLabel || tab.label }
							selected={ tabIndex === selectedTabIndex }
							tabClick={ tabClick }
							icon={ tab.icon }
						>
							<span className="store-stats-orders-chart__value value">
								{ formatValue( value, tab.type, itemChartData.data.currency ) }
							</span>
							<Delta
								value={
									// translators: %(percentage)s is a percentage number, %(date)s is a date, month, or year in short format.
									translate( '%(percentage)s%% since %(date)s', {
										args: {
											percentage: deltaValue,
											date: moment( delta.reference_period, periodFormat ).format(
												UNITS[ unit ].shortFormat
											),
										},
									} )
								}
								className={ `${ delta.favorable } ${ delta.direction }` }
								iconSize={ 24 }
							/>
						</Tab>
					);
				} ) }
			</Tabs>
		);
	};

	render() {
		const { data, selectedDate, unit, slug } = this.props;

		return (
			<StoreStatsChart
				data={ data }
				selectedDate={ selectedDate }
				unit={ unit }
				renderTabs={ this.renderTabs }
				slug={ slug }
				basePath="/store/stats/orders"
				tabs={ tabs }
			/>
		);
	}
}

export default connect( ( state, { query, siteId } ) => {
	const statsData = getSiteStatsNormalizedData( state, siteId, 'statsOrders', query );
	return {
		data: statsData.data,
		deltas: statsData.deltas,
		isRequesting: isRequestingSiteStatsForQuery( state, siteId, 'statsOrders', query ),
	};
} )( localize( withLocalizedMoment( StoreStatsOrdersChart ) ) );
