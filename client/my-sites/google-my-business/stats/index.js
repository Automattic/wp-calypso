/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import StatsFirstView from 'my-sites/stats/stats-first-view';
import StatsNavigation from 'blocks/stats-navigation';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import { getSelectedSiteSlug, getSelectedSiteId } from 'state/ui/selectors';
import DocumentHead from 'components/data/document-head';
import Card from 'components/card';
import SectionHeader from 'components/section-header';
import PieChart from 'components/pie-chart';
import SearchDataType from './search-data-type';

class GoogleMyBusinessStats extends Component {
	static propTypes = {
		translate: PropTypes.func.isRequired,
		siteSlug: PropTypes.string.isRequired,
		siteId: PropTypes.number.isRequired,
		searchData: PropTypes.arrayOf( SearchDataType ).isRequired,
		searchDataTotal: PropTypes.number.isRequired,
	};

	render() {
		const { translate, siteSlug, siteId, searchData, searchDataTotal } = this.props;

		return (
			<Main wideLayout>
				<DocumentHead title={ translate( 'Stats' ) } />
				<StatsFirstView />
				<SidebarNavigation />
				<StatsNavigation selectedItem={ 'googleMyBusiness' } siteId={ siteId } slug={ siteSlug } />

				<div>
					<SectionHeader label={ translate( 'How customers search for your business' ) } />
					<Card>
						<PieChart
							data={ searchData }
							title={ translate( '%(searchDataTotal)d Total Searches', {
								args: { searchDataTotal },
							} ) }
						/>
					</Card>
				</div>
			</Main>
		);
	}
}

const dataSummer = ( prevResult, datum ) => prevResult + datum.value;

export default connect( state => {
	const searchData = [
		{
			name: 'Direct',
			description: 'Customers who find your listing searching for you business name or address',
			value: 362,
		},
		{
			name: 'Discovery',
			description: 'Customers who findyour listing searching for a category, product, or service',
			value: 189,
		},
	];
	const searchDataTotal = searchData.reduce( dataSummer, 0 );

	return {
		siteSlug: getSelectedSiteSlug( state ),
		siteId: getSelectedSiteId( state ),
		searchData,
		searchDataTotal,
	};
} )( localize( GoogleMyBusinessStats ) );
