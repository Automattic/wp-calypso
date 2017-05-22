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
import Navigation from './store-stats-navigation';
import { getSelectedSiteId } from 'state/ui/selectors';
import Chart from './store-stats-chart';

class StoreStats extends Component {
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
			<Main className="store-stats woocommerce" wideLayout={ true }>
				<Navigation unit={ unit } type="orders" />
				<Chart
					path={ path }
					query={ ordersQuery }
					selectedDate={ selectedDate }
					siteId={ siteId }
				/>
			</Main>
		);
	}
}

const localizedStats = localize( StoreStats );

export default connect(
	state => {
		return {
			siteId: getSelectedSiteId( state ),
		};
	}
)( localizedStats );
