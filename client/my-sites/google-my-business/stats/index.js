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
import DocumentHead from 'components/data/document-head';
import FakeData from './fake-data';
import GoogleMyBusinessLocation from 'my-sites/google-my-business/location';
import GoogleMyBusinessLocationType from 'my-sites/google-my-business/location/location-type';
import GoogleMyBusinessStatsTip from 'my-sites/google-my-business/stats/tip';
import GoogleMyBusinessStatsChart from 'my-sites/google-my-business/stats/chart';
import Main from 'components/main';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import PieChart from 'components/pie-chart';
import PieChartLegend from 'components/pie-chart/legend';
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
		this.props.recordTracksEvent( 'calypso_google_my_business_stats_update_listing_button_click' );
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

				<GoogleMyBusinessLocation location={ locationData }>
					<Button
						href="https://business.google.com/"
						onClick={ this.trackUpdateListingClick }
						target="_blank"
					>
						{ translate( 'Update Listing' ) } <Gridicon icon={ 'external' } />
					</Button>
				</GoogleMyBusinessLocation>

				<div className="gmb-stats__metrics">
					<div className="gmb-stats__metric">
						<SectionHeader label={ translate( 'How customers search for your business' ) } />
						<Card>
							<div className={ 'gmb-stats__metric-search' }>
								<PieChart
									data={ searchData }
									title={ translate( '%(total)d Total Searches', {
										args: { total: searchDataTotal },
									} ) }
									className={ 'gmb-stats__metric-search-chart' }
								/>
								<PieChartLegend data={ searchData } />
							</div>
						</Card>
					</div>

					<div className="gmb-stats__metric">
						<GoogleMyBusinessStatsTip
							buttonHref="https://business.google.com/"
							buttonText={ translate( 'Post Photos' ) }
							eventName="'calypso_google_my_business_stats_post_photos_button_click'"
							illustration="reviews"
							text={ translate(
								'Listings with recent photos typically drive more view to their business websites.'
							) }
						/>
					</div>

					<div className="gmb-stats__metric">
						<GoogleMyBusinessStatsChart
							title={ translate( 'Where your customers view your business on Google' ) }
							description={ translate(
								'The Google services that customers use to find your business'
							) }
							data={ viewData }
						/>
					</div>

					<div className="gmb-stats__metric">
						<GoogleMyBusinessStatsChart
							title={ translate( 'Customer Actions' ) }
							description={ translate(
								'The most common actions that customers take on your listing'
							) }
							data={ actionData }
						/>
					</div>

					<div className="gmb-stats__metric">
						<GoogleMyBusinessStatsTip
							buttonHref="https://business.google.com/"
							buttonText={ translate( 'Complete Your Listing' ) }
							eventName="'calypso_google_my_business_stats_complete_your_listing_button_click'"
							illustration="complete-listing"
							text={ translate(
								'Complete business listings get on average 7x more clicks than empty listings.'
							) }
						/>
					</div>

					<div className="gmb-stats__metric">
						<GoogleMyBusinessStatsTip
							buttonHref="https://business.google.com/"
							buttonText={ translate( 'Complete Your Listing' ) }
							eventName="'calypso_google_my_business_stats_complete_your_listing_button_click'"
							illustration="compare"
							text={ translate(
								'Customers compare business listings on Google to make decisions. Make your listing count.'
							) }
						/>
					</div>
				</div>
			</Main>
		);
	}
}

export default connect(
	state => ( {
		actionData: FakeData.actionData,
		locationData: FakeData.locationData,
		searchData: FakeData.searchData,
		searchDataTotal: FakeData.searchDataTotal,
		siteId: getSelectedSiteId( state ),
		siteSlug: getSelectedSiteSlug( state ),
		viewData: FakeData.viewData,
	} ),
	{
		recordTracksEvent,
	}
)( localize( GoogleMyBusinessStats ) );
