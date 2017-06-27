/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { moment } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import Navigation from './store-stats-navigation';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import Chart from './store-stats-chart';
import StatsPeriodNavigation from 'my-sites/stats/stats-period-navigation';
import DatePicker from 'my-sites/stats/stats-date-picker';
import { UNITS } from './constants';

class StoreStats extends Component {
	static propTypes = {
		path: PropTypes.string.isRequired,
		queryDate: PropTypes.string,
		selectedDate: PropTypes.string,
		siteId: PropTypes.number,
		unit: PropTypes.string.isRequired,
	};

	render() {
		const { path, queryDate, selectedDate, siteId, slug, unit } = this.props;
		const unitQueryDate = ( unit === 'week' )
			? `${ moment( queryDate ).format( UNITS[ unit ].format ) }-W${ moment( queryDate ).isoWeek() }`
			: moment( queryDate ).format( UNITS[ unit ].format );
		const unitSelectedDate = ( unit === 'week' )
			? moment( selectedDate ).endOf( 'isoWeek' ).format( 'YYYY-MM-DD' )
			: moment( selectedDate ).endOf( unit ).format( 'YYYY-MM-DD' );
		const ordersQuery = {
			unit,
			date: queryDate,
			quantity: UNITS[ unit ].quantity,
		};
		return (
			<Main className="store-stats woocommerce" wideLayout={ true }>
				<Navigation unit={ unit } type="orders" slug={ slug } />
				<Chart
					path={ path }
					query={ Object.assign( {}, ordersQuery, { date: unitQueryDate } ) }
					selectedDate={ unitSelectedDate }
					siteId={ siteId }
					unit={ unit }
				/>
				<StatsPeriodNavigation
					date={ selectedDate }
					period={ unit }
					url={ `/store/stats/orders/${ unit }/${ slug }` }
				>
					<DatePicker
						period={ unit }
						date={ selectedDate }
						query={ ordersQuery }
						statsType="statsOrders"
						showQueryDate
					/>
				</StatsPeriodNavigation>
			</Main>
		);
	}
}

export default connect(
	state => ( {
		slug: getSelectedSiteSlug( state ),
		siteId: getSelectedSiteId( state ),
	} )
)( StoreStats );
