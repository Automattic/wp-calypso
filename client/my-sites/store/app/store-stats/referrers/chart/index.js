import { translate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import Tabs from 'calypso/my-sites/stats/stats-tabs';
import Tab from 'calypso/my-sites/stats/stats-tabs/tab';
import getStoreReferrersByReferrer from 'calypso/state/selectors/get-store-referrers-by-referrer';
import { referrerChartTabs as tabs } from '../../constants';
import StoreStatsChart from '../../store-stats-chart';
import { formatValue } from '../../utils';

class Chart extends Component {
	static propTypes = {
		data: PropTypes.array.isRequired,
		selectedDate: PropTypes.string,
		selectedReferrer: PropTypes.string,
		chartFormat: PropTypes.string,
	};

	formatTabValue = ( tab, item ) => {
		return ( value ) => formatValue( value, tab.type, item.currency );
	};

	renderTabs = ( { chartData, selectedIndex, selectedTabIndex, tabClick } ) => {
		return (
			<Tabs data={ chartData }>
				{ tabs.map( ( tab, index ) => {
					const item = chartData[ selectedIndex ].data;
					return (
						<Tab
							key={ tab.attr }
							index={ index }
							label={ tab.label }
							selected={ index === selectedTabIndex }
							tabClick={ tabClick }
							gridicon={ tab.gridicon }
							value={ item[ tab.attr ] }
							format={ this.formatTabValue( tab, item ) }
						/>
					);
				} ) }
			</Tabs>
		);
	};

	render() {
		const { data, selectedDate, unit, slug, selectedReferrer } = this.props;
		const chartTitle = (
			<div className="chart__title">
				<span className="chart__title-label">{ `${ translate( 'Selected Referrer' ) }:` }</span>
				<span className="chart__title-referrer">{ selectedReferrer || 'All' }</span>
			</div>
		);

		return (
			<StoreStatsChart
				basePath={ '/store/stats/referrers' }
				chartTitle={ chartTitle }
				data={ data }
				renderTabs={ this.renderTabs }
				selectedDate={ selectedDate }
				slug={ slug }
				tabs={ tabs }
				urlQueryParam={ { referrer: selectedReferrer } }
				unit={ unit }
			/>
		);
	}
}

export default connect( ( state, { siteId, query, selectedReferrer } ) => {
	return {
		data: getStoreReferrersByReferrer( state, {
			siteId,
			statType: 'statsStoreReferrers',
			query,
			selectedReferrer,
		} ),
	};
} )( Chart );
