/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import page from 'page';
import { connect } from 'react-redux';

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
import { topProducts, topCategories, topCoupons } from 'woocommerce/app/store-stats/constants';

const listType = {
	products: topProducts,
	categories: topCategories,
	coupons: topCoupons,
};

class StoreStatsListView extends Component {
	static propTypes = {
		context: PropTypes.object.isRequired,
		path: PropTypes.string.isRequired,
		selectedDate: PropTypes.string,
		siteId: PropTypes.number,
		unit: PropTypes.string.isRequired,
		type: PropTypes.string.isRequired,
	};

	goBack = () => {
		const pathParts = this.props.path.split( '/' );
		const queryString = this.props.context.querystring ? '?' + this.props.context.querystring : '';
		const pathExtra = `${ pathParts[ pathParts.length - 2 ] }/${ pathParts[ pathParts.length - 1 ] }${ queryString }`;
		const defaultBack = `/store/stats/orders/${ pathExtra }`;

		setTimeout( () => {
			page.show( defaultBack );
		} );
	};

	render() {
		const { siteId, slug, selectedDate, type, unit } = this.props;
		const listviewQuery = {
			unit,
			date: selectedDate,
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
						date={ selectedDate }
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
						values={ topProducts.values }
						query={ listviewQuery }
						statType={ listType[ type ].statType }
					/>
				</Module>
			</Main>
		);
	}
}

export default connect(
	state => ( {
		slug: getSelectedSiteSlug( state ),
		siteId: getSelectedSiteId( state ),
	} )
)( StoreStatsListView );
