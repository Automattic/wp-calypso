/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { getQueries } from './utils';
import JetpackColophon from 'components/jetpack-colophon';
import List from './store-stats-list';
import Main from 'components/main';
import Module from './store-stats-module';
import { topProducts, topCategories, topCoupons } from 'woocommerce/app/store-stats/constants';
import QuerySiteStats from 'components/data/query-site-stats';
import StoreStatsPeriodNav from 'woocommerce/app/store-stats/store-stats-period-nav';

const listType = {
	products: topProducts,
	categories: topCategories,
	coupons: topCoupons,
};

class StoreStatsListView extends Component {
	static propTypes = {
		path: PropTypes.string.isRequired,
		selectedDate: PropTypes.string,
		siteId: PropTypes.number,
		querystring: PropTypes.string,
		type: PropTypes.string.isRequired,
		unit: PropTypes.string.isRequired,
		slug: PropTypes.string.isRequired,
	};

	render() {
		const { siteId, slug, selectedDate, type, unit } = this.props;
		const { topListQuery } = getQueries( unit, selectedDate, { topListQuery: { limit: 100 } } );
		const statType = listType[ type ].statType;
		return (
			<Main className="store-stats__list-view woocommerce" wideLayout>
				{ siteId && (
					<QuerySiteStats statType={ statType } siteId={ siteId } query={ topListQuery } />
				) }
				<StoreStatsPeriodNav
					type={ type }
					selectedDate={ selectedDate }
					unit={ unit }
					slug={ slug }
					query={ topListQuery }
					statType={ statType }
					title={ listType[ type ].title }
				/>
				<Module
					siteId={ siteId }
					emptyMessage={ listType[ type ].empty }
					query={ topListQuery }
					statType={ statType }
				>
					<List
						siteId={ siteId }
						values={ listType[ type ].values }
						query={ topListQuery }
						statType={ statType }
					/>
				</Module>
				<JetpackColophon />
			</Main>
		);
	}
}

export default connect( state => ( {
	slug: getSelectedSiteSlug( state ),
	siteId: getSelectedSiteId( state ),
} ) )( StoreStatsListView );
