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
import DocumentHead from 'components/data/document-head';
import FakeData from './fake-data';
import Notice from 'components/notice';
import GoogleMyBusinessLocation from 'my-sites/google-my-business/location';
import GoogleMyBusinessLocationType from 'my-sites/google-my-business/location/location-type';
import GoogleMyBusinessStatsChart from 'my-sites/google-my-business/stats/chart';
import GoogleMyBusinessStatsTip from 'my-sites/google-my-business/stats/tip';
import Main from 'components/main';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import SectionHeader from 'components/section-header';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import StatsNavigation from 'blocks/stats-navigation';
import { getSelectedSiteSlug, getSelectedSiteId } from 'state/ui/selectors';
import { recordTracksEvent } from 'state/analytics/actions';

class GoogleMyBusinessStats extends Component {
	static propTypes = {
		locationData: GoogleMyBusinessLocationType.isRequired,
		recordTracksEvent: PropTypes.func.isRequired,
		siteId: PropTypes.number.isRequired,
		siteSlug: PropTypes.string.isRequired,
		translate: PropTypes.func.isRequired,
	};

	trackUpdateListingClick = () => {
		this.props.recordTracksEvent( 'calypso_google_my_business_stats_update_listing_button_click' );
	};

	searchChartTitleFunc = ( translate, dataTotal ) => {
		return translate( '%(dataTotal)d Total Searches', {
			args: {
				dataTotal,
			},
		} );
	};

	viewChartTitleFunc = ( translate, dataTotal ) => {
		return translate( '%(dataTotal)d Total Views', {
			args: {
				dataTotal,
			},
		} );
	};

	actionChartTitleFunc = ( translate, dataTotal ) => {
		return translate( '%(dataTotal)d Total Actions', {
			args: {
				dataTotal,
			},
		} );
	};

	render() {
		const { locationData, siteId, siteSlug, translate } = this.props;

		return (
			<Main wideLayout>
				<PageViewTracker
					path="/google-my-business/stats/:site"
					title="Google My Business > Stats"
				/>

				<DocumentHead title={ translate( 'Stats' ) } />

				<SidebarNavigation />

				<StatsNavigation selectedItem={ 'googleMyBusiness' } siteId={ siteId } slug={ siteSlug } />

				{ /* remove this notice once we stop using fake data */ }
				<Notice
					status="is-error"
					showDismiss={ false }
					text="All data on this page is a placeholder used for development only!"
				/>

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
						<GoogleMyBusinessStatsChart
							title={ translate( 'How customers search for your business' ) }
							statType="QUERIES"
							chartTitle={ this.searchChartTitleFunc }
							dataSeriesInfo={ {
								QUERIES_DIRECT: {
									name: translate( 'Direct' ),
									description: translate(
										'Customers who find your listing searching for you business name or address'
									),
								},
								QUERIES_INDIRECT: {
									name: translate( 'Discovery' ),
									description: translate(
										'Customers who find your listing searching for a category, product, or service'
									),
								},
							} }
						/>
						<SectionHeader label={ translate( 'How customers search for your business' ) } />
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
							statType="VIEWS"
							chartTitle={ this.viewChartTitleFunc }
							dataSeriesInfo={ {
								VIEWS_MAPS: {
									name: translate( 'Listings On Maps' ),
								},
								VIEWS_SEARCH: {
									name: translate( 'Listings On Search' ),
								},
							} }
						/>
					</div>

					<div className="gmb-stats__metric">
						<GoogleMyBusinessStatsChart
							title={ translate( 'Customer Actions' ) }
							description={ translate(
								'The most common actions that customers take on your listing'
							) }
							statType="ACTIONS"
							chartTitle={ this.actionChartTitleFunc }
							dataSeriesInfo={ {
								ACTIONS_WEBSITE: {
									name: translate( 'Visit Your Website' ),
								},
								ACTIONS_DRIVING_DIRECTIONS: {
									name: translate( 'Request Directions' ),
								},
								ACTIONS_PHONE: {
									name: translate( 'Call You' ),
								},
							} }
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
		locationData: FakeData.locationData,
		siteId: getSelectedSiteId( state ),
		siteSlug: getSelectedSiteSlug( state ),
	} ),
	{
		recordTracksEvent,
	}
)( localize( GoogleMyBusinessStats ) );
