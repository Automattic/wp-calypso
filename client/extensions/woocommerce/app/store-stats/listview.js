/**
 * External dependencies
 */
import { moment } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import List from './store-stats-list';
import Module from './store-stats-module';
import StoreStatsNavigationTabs from './store-stats-navigation/navtabs';
import { getUnitPeriod } from './utils';
import QueryJetpackPlugins from 'components/data/query-jetpack-plugins';
import QuerySiteStats from 'components/data/query-site-stats';
import HeaderCake from 'components/header-cake';
import JetpackColophon from 'components/jetpack-colophon';
import Main from 'components/main';
import SectionNav from 'components/section-nav';
import DatePicker from 'my-sites/stats/stats-date-picker';
import StatsPeriodNavigation from 'my-sites/stats/stats-period-navigation';
import { getJetpackSites } from 'state/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { topProducts, topCategories, topCoupons, UNITS } from 'woocommerce/app/store-stats/constants';

const listType = {
	products: topProducts,
	categories: topCategories,
	coupons: topCoupons,
};

class StoreStatsListView extends Component {
	static propTypes = {
		jetPackSites: PropTypes.array,
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
		const { jetPackSites, siteId, slug, selectedDate, type, unit } = this.props;
		const unitSelectedDate = getUnitPeriod( selectedDate, unit );
		const listviewQuery = {
			unit,
			date: unitSelectedDate,
			limit: 100,
		};
		const statType = listType[ type ].statType;
		return (
			<Main className="store-stats__list-view woocommerce" wideLayout={ true }>
				<QueryJetpackPlugins siteIds={ jetPackSites.map( site => site.ID ) } />
				{ siteId && <QuerySiteStats statType={ statType } siteId={ siteId } query={ listviewQuery } /> }
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
						statsType={ statType }
						showQueryDate
					/>
				</StatsPeriodNavigation>
				<SectionNav className="store-stats__list-view-navigation" selectedText={ UNITS[ unit ].title }>
					<StoreStatsNavigationTabs
						label={ 'Stats' }
						slug={ slug }
						type={ type }
						unit={ unit }
						units={ UNITS }
					/>
				</SectionNav>
				<Module
					siteId={ siteId }
					emptyMessage={ listType[ type ].empty }
					query={ listviewQuery }
					statType={ statType }
				>
					<List
						siteId={ siteId }
						values={ listType[ type ].values }
						query={ listviewQuery }
						statType={ statType }
					/>
				</Module>
				<JetpackColophon />
			</Main>
		);
	}
}

export default connect(
	state => ( {
		slug: getSelectedSiteSlug( state ),
		siteId: getSelectedSiteId( state ),
		jetPackSites: getJetpackSites( state ),
	} )
)( StoreStatsListView );
