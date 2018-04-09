/** @format */

/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize, translate } from 'i18n-calypso';
import { random, range } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import CardHeading from 'components/card-heading';
import Chart from 'components/chart';
import DocumentHead from 'components/data/document-head';
import GoogleMyBusinessLocation from 'my-sites/google-my-business/location';
import GoogleMyBusinessLocationType from 'my-sites/google-my-business/location/location-type';
import Main from 'components/main';
import PieChart from 'components/pie-chart';
import SearchDataType from './search-data-type';
import SectionHeader from 'components/section-header';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import StatsNavigation from 'blocks/stats-navigation';
import { getSelectedSiteSlug, getSelectedSiteId } from 'state/ui/selectors';

class GoogleMyBusinessStats extends Component {
	static propTypes = {
		actionData: PropTypes.array.isRequired,
		locationData: GoogleMyBusinessLocationType.isRequired,
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
			locationData,
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
					<Card className="gmb-location">
						<GoogleMyBusinessLocation location={ locationData } />

						<Button className="gmb-location__button">
							{ translate( 'Update Listing' ) } { <Gridicon icon={ 'external' } /> }
						</Button>
					</Card>

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
		name: translate( 'Direct' ),
		description: translate(
			'Customers who find your listing searching for you business name or address'
		),
		value: random( 300, 500 ),
	},
	{
		name: translate( 'Discovery' ),
		description: translate(
			'Customers who find your listing searching for a category, product, or service'
		),
		value: random( 200, 400 ),
	},
];

const searchDataTotal = searchData.reduce( dataSummer, 0 );

const viewData = range( 19, 30 ).map( day => ( {
	value: random( 10, 90 ),
	nestedValue: random( 5, 80 ),
	label: translate( 'Mar %(day)d', {
		args: { day },
	} ),
} ) );

const actionData = range( 19, 30 ).map( day => ( {
	value: random( 10, 90 ),
	nestedValue: random( 5, 80 ),
	label: translate( 'Mar %(day)d', {
		args: { day },
	} ),
} ) );

const locationData = {
	id: 12345,
	address: [
		'Centre Commercial Cap 3000',
		'Avenue Eugene Donadei',
		'06700 Saint-Laurent-du-Var',
		'France',
	],
	name: 'Starbucks',
	photo: 'http://www.shantee.net/wp-content/uploads/2016/02/cookies-internet-1030x684.jpg',
	verified: true,
};

export default connect( state => ( {
	actionData,
	locationData,
	searchData,
	searchDataTotal,
	siteId: getSelectedSiteId( state ),
	siteSlug: getSelectedSiteSlug( state ),
	viewData,
} ) )( localize( GoogleMyBusinessStats ) );
