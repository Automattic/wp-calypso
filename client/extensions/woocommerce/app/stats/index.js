/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import StatsNavigation from './stats-navigation';
import { getSelectedSiteId } from 'state/ui/selectors';
import StatsChart from './stats-chart';

class Stats extends Component {
	static propTypes = {
		siteId: PropTypes.number,
		unit: PropTypes.string.isRequired,
		startDate: PropTypes.string,
		path: PropTypes.string.isRequired,
	};

	render() {
		const { siteId, unit, startDate, path } = this.props;
		const today = this.props.moment().format( 'YYYY-MM-DD' );
		const selectedDate = startDate || today;
		const ordersQuery = {
			unit,
			date: today,
			quantity: '30'
		};
		return (
			<Main className="woocommerce stats" wideLayout={ true }>
				<StatsNavigation unit={ unit } type="orders" />
				<StatsChart
					path={ path }
					query={ ordersQuery }
					selectedDate={ selectedDate }
					siteId={ siteId }
				/>
			</Main>
		);
	}
}

const localizedStats = localize( Stats );

export default connect(
	state => {
		return {
			siteId: getSelectedSiteId( state ),
		};
	}
)( localizedStats );
