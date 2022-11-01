import config from '@automattic/calypso-config';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import moment from 'moment';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import titlecase from 'to-title-case';
import StatsNavigation from 'calypso/blocks/stats-navigation';
import Intervals from 'calypso/blocks/stats-navigation/intervals';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import FormattedHeader from 'calypso/components/formatted-header';
import JetpackColophon from 'calypso/components/jetpack-colophon';
import Main from 'calypso/components/main';
import SectionHeader from 'calypso/components/section-header';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import DatePicker from 'calypso/my-sites/stats/stats-date-picker';
import StatsPeriodNavigation from 'calypso/my-sites/stats/stats-period-navigation';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { sparkWidgets, topProducts, topCategories, topCoupons, noDataMsg } from './constants';
import List from './store-stats-list';
import Module from './store-stats-module';
import Chart from './store-stats-orders-chart';
import WidgetList from './store-stats-widget-list';
import { getEndPeriod, getQueries, getWidgetPath } from './utils';

class StoreStats extends Component {
	static propTypes = {
		path: PropTypes.string.isRequired,
		queryDate: PropTypes.string,
		queryParams: PropTypes.object.isRequired,
		selectedDate: PropTypes.string,
		siteId: PropTypes.number,
		unit: PropTypes.string.isRequired,
	};

	render() {
		const { queryDate, selectedDate, siteId, slug, unit, queryParams, translate } = this.props;
		const endSelectedDate = getEndPeriod( selectedDate, unit );
		const { orderQuery } = getQueries( unit, queryDate );
		const { topListQuery } = getQueries( unit, selectedDate );
		const topWidgets = [ topProducts, topCategories, topCoupons ];
		const widgetPath = getWidgetPath( unit, slug, queryParams );

		// New feature gate
		const isNewFeatured = config.isEnabled( 'stats/new-main-chart' );

		// For period option links
		const store = {
			label: translate( 'Store' ),
			path: '/store/stats/orders',
			showIntervals: true,
		};
		const slugPath = slug ? `/${ slug }` : '';
		const pathTemplate = `${ store.path }/{{ interval }}${ slugPath }`;

		const classes = classNames( 'store-stats', 'woocommerce', {
			'stats--new-main-chart': isNewFeatured,
		} );

		return (
			<Main className={ classes } wideLayout>
				<PageViewTracker
					path={ `/store/stats/orders/${ unit }/:site` }
					title={ `Store > Stats > Orders > ${ titlecase( unit ) }` }
				/>

				{ siteId && (
					<QuerySiteStats statType="statsOrders" siteId={ siteId } query={ orderQuery } />
				) }

				<FormattedHeader
					brandFont
					className="store-stats__section-header"
					headerText={ translate( 'Jetpack Stats' ) }
					align="left"
					subHeaderText={ translate(
						'Learn valuable insights about the purchases made on your store.'
					) }
				/>

				<StatsNavigation selectedItem="store" siteId={ siteId } slug={ slug } interval={ unit } />

				{ isNewFeatured ? (
					<>
						<div className="stats__period-header">
							<StatsPeriodNavigation
								date={ selectedDate }
								period={ unit }
								url={ `/store/stats/orders/${ unit }/${ slug }` }
							>
								<DatePicker
									period={ unit }
									// this is needed to counter the +1d adjustment made in DatePicker for weeks
									date={
										unit === 'week'
											? moment( selectedDate, 'YYYY-MM-DD' )
													.subtract( 1, 'days' )
													.format( 'YYYY-MM-DD' )
											: selectedDate
									}
									query={ orderQuery }
									statsType="statsOrders"
									showQueryDate
								/>
							</StatsPeriodNavigation>
							<Intervals selected={ unit } pathTemplate={ pathTemplate } compact={ false } />
						</div>

						<Chart
							query={ orderQuery }
							selectedDate={ endSelectedDate }
							siteId={ siteId }
							unit={ unit }
							slug={ slug }
						/>
					</>
				) : (
					<>
						<Chart
							query={ orderQuery }
							selectedDate={ endSelectedDate }
							siteId={ siteId }
							unit={ unit }
							slug={ slug }
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
									unit === 'week'
										? moment( selectedDate, 'YYYY-MM-DD' )
												.subtract( 1, 'days' )
												.format( 'YYYY-MM-DD' )
										: selectedDate
								}
								query={ orderQuery }
								statsType="statsOrders"
								showQueryDate
							/>
						</StatsPeriodNavigation>
					</>
				) }

				<div className="store-stats__widgets">
					{ sparkWidgets.map( ( widget, index ) => (
						<div
							className="store-stats__widgets-column widgets stats__module-headerless--unified"
							key={ index }
						>
							<Module
								siteId={ siteId }
								emptyMessage={ noDataMsg }
								query={ orderQuery }
								statType="statsOrders"
							>
								<WidgetList
									siteId={ siteId }
									query={ orderQuery }
									selectedDate={ endSelectedDate }
									statType="statsOrders"
									widgets={ widget }
								/>
							</Module>
						</div>
					) ) }
					{ topWidgets.map( ( widget ) => {
						const header = (
							<SectionHeader href={ widget.basePath + widgetPath } label={ widget.title } />
						);
						return (
							<div
								className="store-stats__widgets-column stats__module--unified"
								key={ widget.basePath }
							>
								{ siteId && (
									<QuerySiteStats
										statType={ widget.statType }
										siteId={ siteId }
										query={ topListQuery }
									/>
								) }
								<Module
									siteId={ siteId }
									header={ header }
									emptyMessage={ widget.empty }
									query={ topListQuery }
									statType={ widget.statType }
								>
									<List
										siteId={ siteId }
										values={ widget.values }
										query={ topListQuery }
										statType={ widget.statType }
									/>
								</Module>
							</div>
						);
					} ) }
				</div>

				<JetpackColophon />
			</Main>
		);
	}
}

export default connect( ( state ) => ( {
	slug: getSelectedSiteSlug( state ),
	siteId: getSelectedSiteId( state ),
} ) )( localize( StoreStats ) );
