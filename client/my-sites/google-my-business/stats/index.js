/** @format */

/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import CardHeading from 'components/card-heading';
import Chart from 'components/chart';
import DocumentHead from 'components/data/document-head';
import FakeData from './fake-data';
import GoogleMyBusinessLocation from 'my-sites/google-my-business/location';
import GoogleMyBusinessLocationType from 'my-sites/google-my-business/location/location-type';
import Main from 'components/main';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import PieChart from 'components/pie-chart';
import SearchDataType from './search-data-type';
import SectionHeader from 'components/section-header';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import StatsNavigation from 'blocks/stats-navigation';
import { getSelectedSiteSlug, getSelectedSiteId } from 'state/ui/selectors';
import { recordTracksEvent } from 'state/analytics/actions';

class GoogleMyBusinessStats extends Component {
	static propTypes = {
		actionData: PropTypes.array.isRequired,
		locationData: GoogleMyBusinessLocationType.isRequired,
		recordTracksEvent: PropTypes.func.isRequired,
		searchData: PropTypes.arrayOf( SearchDataType ).isRequired,
		searchDataTotal: PropTypes.number.isRequired,
		siteId: PropTypes.number.isRequired,
		siteSlug: PropTypes.string.isRequired,
		translate: PropTypes.func.isRequired,
		viewData: PropTypes.array.isRequired,
	};

	trackUpdateListingClick = () => {
		this.props.recordTracksEvent(
			'calypso_google_my_business_stats_update_listing_button_click'
		);
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
				<PageViewTracker
					path="/google-my-business/stats/:site"
					title="Google My Business > Stats"
				/>

				<DocumentHead title={ translate( 'Stats' ) } />

				<SidebarNavigation />

				<StatsNavigation selectedItem={ 'googleMyBusiness' } siteId={ siteId } slug={ siteSlug } />

				<div>
					<GoogleMyBusinessLocation location={ locationData }>
						<Button
							href="https://www.google.com/business/"
							onClick={ this.trackUpdateListingClick }
							target="_blank"
						>
							{ translate( 'Update Listing' ) } <Gridicon icon={ 'external' } />
						</Button>
					</GoogleMyBusinessLocation>

					<SectionHeader label={ translate( 'How customers search for your business' ) } />
					<Card>
						<PieChart
							data={ searchData }
							title={ translate( '%(total)d Total Searches', {
								args: { total: searchDataTotal },
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

export default connect( state => ( {
	actionData: FakeData.actionData,
	locationData: FakeData.locationData,
	searchData: FakeData.searchData,
	searchDataTotal: FakeData.searchDataTotal,
	siteId: getSelectedSiteId( state ),
	siteSlug: getSelectedSiteSlug( state ),
	viewData: FakeData.viewData,
} ), {
	recordTracksEvent,
} )( localize( GoogleMyBusinessStats ) );
