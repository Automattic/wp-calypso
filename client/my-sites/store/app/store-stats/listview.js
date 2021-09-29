import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import titlecase from 'to-title-case';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import JetpackColophon from 'calypso/components/jetpack-colophon';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { topProducts, topCategories, topCoupons } from './constants';
import List from './store-stats-list';
import Module from './store-stats-module';
import StoreStatsPeriodNav from './store-stats-period-nav';
import { getQueries } from './utils';

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
		type: PropTypes.string.isRequired,
		unit: PropTypes.string.isRequired,
		slug: PropTypes.string.isRequired,
	};

	render() {
		const { siteId, slug, selectedDate, type, unit, queryParams } = this.props;
		const { topListQuery } = getQueries( unit, selectedDate, { topListQuery: { limit: 100 } } );
		const statType = listType[ type ].statType;
		return (
			<Main className="store-stats__list-view woocommerce" wideLayout>
				<PageViewTracker
					path={ `/store/stats/${ type }/${ unit }/:site` }
					title={ `Store > Stats > ${ titlecase( type ) } > ${ titlecase( unit ) }` }
				/>
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
					queryParams={ queryParams }
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

export default connect( ( state ) => ( {
	slug: getSelectedSiteSlug( state ),
	siteId: getSelectedSiteId( state ),
} ) )( StoreStatsListView );
