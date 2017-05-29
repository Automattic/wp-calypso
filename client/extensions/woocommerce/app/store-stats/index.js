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
import Module from './store-stats-module';
import List from './store-stats-list';
import SectionHeader from 'components/section-header';
import { topProducts, topCategories, topCoupons, UNITS } from 'woocommerce/app/store-stats/constants';

class StoreStats extends Component {
	static propTypes = {
		path: PropTypes.string.isRequired,
		queryDate: PropTypes.string,
		querystring: PropTypes.string,
		selectedDate: PropTypes.string,
		siteId: PropTypes.number,
		unit: PropTypes.string.isRequired,
	};

	render() {
		const { path, queryDate, selectedDate, siteId, slug, unit, querystring } = this.props;
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
		const topQuery = {
			unit,
			date: selectedDate,
			limit: 10,
		};
		const widgets = [ topProducts, topCategories, topCoupons ];
		const widgetPath = `/${ unit }/${ slug }${ querystring ? '?' : '' }${ querystring || '' }`;

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
						// this is needed to counter the +1d adjustment made in DatePicker for weeks
						date={
							( unit === 'week' )
								? moment( selectedDate, 'YYYY-MM-DD' ).subtract( 1, 'days' ).format( 'YYYY-MM-DD' )
								: selectedDate
						}
						query={ ordersQuery }
						statsType="statsOrders"
						showQueryDate
					/>
				</StatsPeriodNavigation>
				<div className="store-stats__widgets">
				{ widgets.map( widget => {
					const header = (
						<SectionHeader href={ widget.basePath + widgetPath }>
							{ widget.title }
						</SectionHeader>
					);
					return (
						<div className="store-stats__widgets-column" key={ widget.basePath }>
							<Module
								siteId={ siteId }
								header={ header }
								emptyMessage={ widget.empty }
								query={ topQuery }
								statType={ widget.statType }
							>
								<List
									siteId={ siteId }
									values={ widget.values }
									query={ topQuery }
									statType={ widget.statType }
								/>
							</Module>
						</div>
					);
				} ) }
				</div>
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
