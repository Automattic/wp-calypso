/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import StatsNavigation from 'blocks/stats-navigation';
import DocumentHead from 'components/data/document-head';
import Gridicon from 'components/gridicon';
import { withLocalizedMoment } from 'components/localized-moment';
import Main from 'components/main';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import QueryKeyringConnections from 'components/data/query-keyring-connections';
import QueryKeyringServices from 'components/data/query-keyring-services';
import QuerySiteKeyrings from 'components/data/query-site-keyrings';
import { CALYPSO_CONTACT } from 'lib/url/support';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import GoogleMyBusinessLocation from 'my-sites/google-my-business/location';
import GoogleMyBusinessStatsChart from 'my-sites/google-my-business/stats/chart';
import { enhanceWithSiteType, recordTracksEvent } from 'state/analytics/actions';
import { getSelectedSiteSlug, getSelectedSiteId } from 'state/ui/selectors';
import getGoogleMyBusinessConnectedLocation from 'state/selectors/get-google-my-business-connected-location';
import { withEnhancers } from 'state/utils';

/**
 * Style dependencies
 */
import './style.scss';

class GoogleMyBusinessStats extends Component {
	static propTypes = {
		locationData: PropTypes.object,
		recordTracksEvent: PropTypes.func.isRequired,
		siteId: PropTypes.number,
		siteSlug: PropTypes.string,
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

	renderViewsTooltipForDatanum = ( datanum, interval ) => {
		const { value: viewCount, date } = datanum;
		if ( interval === 'quarter' ) {
			return this.props.translate(
				'%(value)d view on the week of %(monday)s',
				'%(value)d views on the week of %(monday)s',
				{
					count: viewCount,
					args: {
						value: viewCount,
						monday: this.props.moment( date ).format( 'LL' ),
					},
				}
			);
		}

		return this.props.translate( '%(value)d view on %(day)s', '%(value)d views on %(day)s', {
			count: viewCount,
			args: {
				value: viewCount,
				day: this.props.moment( date ).format( 'LL' ),
			},
		} );
	};

	renderActionsTooltipForDatanum = ( datanum, interval ) => {
		const { value: actionCount, date } = datanum;
		if ( interval === 'quarter' ) {
			return this.props.translate(
				'%(value)d action on the week of %(monday)s',
				'%(value)d actions on the week of %(monday)s',
				{
					count: actionCount,
					args: {
						value: actionCount,
						monday: this.props.moment( date ).format( 'LL' ),
					},
				}
			);
		}

		return this.props.translate( '%(value)d action on %(day)s', '%(value)d actions on %(day)s', {
			count: actionCount,
			args: {
				value: actionCount,
				day: this.props.moment( date ).format( 'LL' ),
			},
		} );
	};

	renderStats() {
		const { siteId, translate } = this.props;

		if ( ! siteId ) {
			return null;
		}

		return (
			<div className="stats__metrics">
				<div className="stats__metric">
					<GoogleMyBusinessStatsChart
						title={ translate( 'How customers search for your business' ) }
						statType="queries"
						chartTitle={ this.searchChartTitleFunc }
						chartType="pie"
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
				</div>

				<div className="stats__metric">
					<GoogleMyBusinessStatsChart
						title={ translate( 'Where your customers view your business on Google' ) }
						description={ translate(
							'The Google services that customers use to find your business'
						) }
						statType="views"
						chartTitle={ this.viewChartTitleFunc }
						dataSeriesInfo={ {
							VIEWS_MAPS: {
								name: translate( 'Listings On Maps' ),
							},
							VIEWS_SEARCH: {
								name: translate( 'Listings On Search' ),
							},
						} }
						renderTooltipForDatanum={ this.renderViewsTooltipForDatanum }
					/>
				</div>

				<div className="stats__metric">
					<GoogleMyBusinessStatsChart
						title={ translate( 'Customer Actions' ) }
						description={ translate(
							'The most common actions that customers take on your listing'
						) }
						statType="actions"
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
						renderTooltipForDatanum={ this.renderActionsTooltipForDatanum }
					/>
				</div>
			</div>
		);
	}

	render() {
		const { isLocationVerified, locationData, siteId, siteSlug, translate } = this.props;

		return (
			<Main wideLayout>
				<PageViewTracker
					path="/google-my-business/stats/:site"
					title="Google My Business > Stats"
				/>

				<DocumentHead title={ translate( 'Stats' ) } />

				<SidebarNavigation />

				<StatsNavigation selectedItem={ 'googleMyBusiness' } siteId={ siteId } slug={ siteSlug } />

				{ siteId && <QuerySiteKeyrings siteId={ siteId } /> }
				<QueryKeyringConnections forceRefresh />
				<QueryKeyringServices />

				{ ! locationData && (
					<Notice
						status="is-error"
						showDismiss={ false }
						text={ translate( 'There is an error with your Google My Business account.' ) }
					>
						<NoticeAction href={ CALYPSO_CONTACT }>{ translate( 'Contact Support' ) }</NoticeAction>
					</Notice>
				) }

				{ !! locationData && ! isLocationVerified && (
					<Notice
						status="is-error"
						text={ translate(
							'Your location has not been verified. ' +
								'Statistics are not available until you have {{a}}verified your location{{/a}} with Google.',
							{
								components: {
									a: (
										<a
											href="https://support.google.com/business/answer/7107242"
											target="_blank"
											rel="noopener noreferrer"
										/>
									),
								},
							}
						) }
					/>
				) }

				<GoogleMyBusinessLocation location={ locationData }>
					<Button
						href="https://business.google.com/"
						onClick={ this.trackUpdateListingClick }
						target="_blank"
					>
						{ translate( 'Update Listing' ) } <Gridicon icon={ 'external' } />
					</Button>
				</GoogleMyBusinessLocation>

				{ this.renderStats() }
			</Main>
		);
	}
}

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const locationData = getGoogleMyBusinessConnectedLocation( state, siteId );
		const isLocationVerified = get( locationData, 'meta.state.isVerified', false );

		return {
			isLocationVerified,
			locationData,
			siteId,
			siteSlug: getSelectedSiteSlug( state ),
		};
	},
	{
		recordTracksEvent: withEnhancers( recordTracksEvent, enhanceWithSiteType ),
	}
)( localize( withLocalizedMoment( GoogleMyBusinessStats ) ) );
