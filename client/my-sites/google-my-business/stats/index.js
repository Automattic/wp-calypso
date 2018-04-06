/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { random, range } from 'lodash';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import StatsNavigation from 'blocks/stats-navigation';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import { getSelectedSiteSlug, getSelectedSiteId } from 'state/ui/selectors';
import DocumentHead from 'components/data/document-head';
import Card from 'components/card';
import CardHeading from 'components/card-heading';
import SectionHeader from 'components/section-header';
import PieChart from 'components/pie-chart';
import Chart from 'components/chart';
import SearchDataType from './search-data-type';

class GoogleMyBusinessStats extends Component {
	static propTypes = {
		actionData: PropTypes.array.isRequired,
		searchData: PropTypes.arrayOf( SearchDataType ).isRequired,
		searchDataTotal: PropTypes.number.isRequired,
		siteId: PropTypes.number.isRequired,
		siteSlug: PropTypes.string.isRequired,
		translate: PropTypes.func.isRequired,
		viewData: PropTypes.array.isRequired,
	};

	render() {
		const {
			actionData,
			searchData,
			searchDataTotal,
			siteId,
			siteSlug,
			translate,
			viewData,
		} = this.props;

		return (
			<Main wideLayout>
				<DocumentHead title={ translate( 'Stats' ) } />
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

					<SectionHeader
						label={ translate( 'Where your customers view your business on Google' ) }
					/>
					<Card>
						<CardHeading tagName={ 'h2' } size={ 16 }>
							{ translate( 'The Google services that customers use to find your business' ) }
						</CardHeading>
						<Chart data={ viewData } />
					</Card>

					<SectionHeader label={ translate( 'Customer Actions' ) } />
					<Card>
						<CardHeading tagName={ 'h2' } size={ 16 }>
							{ translate( 'The most common actions that customers take on your listing' ) }
						</CardHeading>
						<Chart data={ actionData } />
					</Card>
				</div>
			</Main>
		);
	}
}

const dataSummer = ( prevResult, datum ) => prevResult + datum.value;

const searchData = [
	{
		name: 'Direct',
		description: 'Customers who find your listing searching for you business name or address',
		value: random( 300, 500 ),
	},
	{
		name: 'Discovery',
		description: 'Customers who find your listing searching for a category, product, or service',
		value: random( 200, 400 ),
	},
];
const searchDataTotal = searchData.reduce( dataSummer, 0 );

const viewData = range( 19, 30 ).map( day => ( {
	value: random( 10, 90 ),
	nestedValue: random( 5, 80 ),
	label: `Mar ${ day }`,
} ) );

const actionData = range( 19, 30 ).map( day => ( {
	value: random( 10, 90 ),
	nestedValue: random( 5, 80 ),
	label: `Mar ${ day }`,
} ) );

export default connect( state => ( {
	siteSlug: getSelectedSiteSlug( state ),
	siteId: getSelectedSiteId( state ),
	searchData,
	searchDataTotal,
	viewData,
	actionData,
} ) )( localize( GoogleMyBusinessStats ) );
