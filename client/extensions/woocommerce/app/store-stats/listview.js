/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import page from 'page';
import { connect } from 'react-redux';
import { moment } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import HeaderCake from 'components/header-cake';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import StatsPeriodNavigation from 'my-sites/stats/stats-period-navigation';
import DatePicker from 'my-sites/stats/stats-date-picker';
import Module from './store-stats-module';
import List from './store-stats-list';
import {
	topProducts,
	topCategories,
	topCoupons
} from 'woocommerce/app/store-stats/constants';
import { getUnitPeriod } from './utils';
import { isJetpackSite } from 'state/sites/selectors';
import { isPluginActive } from 'state/selectors';

const listType = {
	products: topProducts,
	categories: topCategories,
	coupons: topCoupons,
};

class StoreStatsListView extends Component {
	static propTypes = {
		isWooConnect: PropTypes.bool,
		path: PropTypes.string.isRequired,
		selectedDate: PropTypes.string,
		siteId: PropTypes.number,
		querystring: PropTypes.string,
		type: PropTypes.string.isRequired,
		unit: PropTypes.string.isRequired,
	};

	goBack = () => {
		const pathParts = this.props.path.split( '/' );
		const queryString = this.props.querystring ? '?' + this.props.querystring : '';
		const pathExtra = `${ pathParts[ pathParts.length - 2 ] }/${ pathParts[ pathParts.length - 1 ] }${ queryString }`;
		const defaultBack = `/store/stats/orders/${ pathExtra }`;

		setTimeout( () => {
			page.show( defaultBack );
		} );
	};

	render() {
		const { isWooConnect, siteId, slug, selectedDate, type, unit } = this.props;
		// TODO: this is to handle users switching sites while on store stats
		// unfortunately, we can't access the path when changing sites
		if ( ! isWooConnect ) {
			page.redirect( `/stats/${ slug }` );
		}
		const unitSelectedDate = getUnitPeriod( selectedDate, unit );
		const listviewQuery = {
			unit,
			date: unitSelectedDate,
			limit: 100,
		};
		return (
			<Main className="store-stats__list-view woocommerce" wideLayout={ true }>
				<HeaderCake onClick={ this.goBack }>{ listType[ type ].title }</HeaderCake>
				<StatsPeriodNavigation
					date={ selectedDate }
					period={ unit }
					url={ `/store/stats/${ type }/${ unit }/${ slug }` }
				>
					<DatePicker
						period={ unit }
						date={
							( unit === 'week' )
								? moment( selectedDate, 'YYYY-MM-DD' ).subtract( 1, 'days' ).format( 'YYYY-MM-DD' )
								: selectedDate
						}
						query={ listviewQuery }
						statsType={ listType[ type ].statType }
						showQueryDate
					/>
				</StatsPeriodNavigation>
				<Module
					siteId={ siteId }
					emptyMessage={ listType[ type ].empty }
					query={ listviewQuery }
					statType={ listType[ type ].statType }
				>
					<List
						siteId={ siteId }
						values={ listType[ type ].values }
						query={ listviewQuery }
						statType={ listType[ type ].statType }
					/>
				</Module>
			</Main>
		);
	}
}

export default connect(
	state => {
		const siteId = getSelectedSiteId( state );
		const isJetpack = isJetpackSite( state, siteId );
		return {
			isWooConnect: isJetpack && isPluginActive( state, siteId, 'woocommerce' ),
			slug: getSelectedSiteSlug( state ),
			siteId: getSelectedSiteId( state ),
		};
	}
)( StoreStatsListView );
