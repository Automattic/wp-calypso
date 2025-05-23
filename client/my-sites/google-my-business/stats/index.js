import config from '@automattic/calypso-config';
import { Button, Gridicon } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { CALYPSO_CONTACT } from '@automattic/urls';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import StatsNavigation from 'calypso/blocks/stats-navigation';
import { navItems } from 'calypso/blocks/stats-navigation/constants';
import DocumentHead from 'calypso/components/data/document-head';
import QueryKeyringConnections from 'calypso/components/data/query-keyring-connections';
import QueryKeyringServices from 'calypso/components/data/query-keyring-services';
import QuerySiteKeyrings from 'calypso/components/data/query-site-keyrings';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import NavigationHeader from 'calypso/components/navigation-header';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import GoogleMyBusinessLocation from 'calypso/my-sites/google-my-business/location';
import GoogleMyBusinessStatsChart from 'calypso/my-sites/google-my-business/stats/chart';
import PageHeader from 'calypso/my-sites/stats/components/headers/page-header';
import Main from 'calypso/my-sites/stats/components/stats-main';
import { enhanceWithSiteType, recordTracksEvent } from 'calypso/state/analytics/actions';
import getGoogleMyBusinessConnectedLocation from 'calypso/state/selectors/get-google-my-business-connected-location';
import { getSelectedSiteSlug, getSelectedSiteId } from 'calypso/state/ui/selectors';
import { withEnhancers } from 'calypso/state/utils';

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
		const isStatsNavigationImprovementEnabled = config.isEnabled( 'stats/navigation-improvement' );

		return (
			<Main fullWidthLayout>
				<PageViewTracker
					path="/google-my-business/stats/:site"
					title="Google Business Profile > Stats"
				/>

				<DocumentHead title={ translate( 'Jetpack Stats' ) } />

				<QuerySiteKeyrings siteId={ siteId } />
				<QueryKeyringConnections forceRefresh />
				<QueryKeyringServices />

				<div className="stats">
					{ ! isStatsNavigationImprovementEnabled ? (
						<NavigationHeader
							className="stats__section-header modernized-header"
							title={ translate( 'Jetpack Stats' ) }
							subtitle={ translate(
								'Integrate your business with Google and get stats on your locations. {{learnMoreLink}}Learn more{{/learnMoreLink}}',
								{
									components: {
										learnMoreLink: (
											<a
												href={ localizeUrl(
													'https://wordpress.com/support/google-my-business-integration/#checking-the-impact-of-your-google-my-business-connection'
												) }
												target="_blank"
												rel="noreferrer noopener"
											/>
										),
									},
								}
							) }
							screenReader={ navItems.googleMyBusiness?.label }
						></NavigationHeader>
					) : (
						<PageHeader />
					) }

					<StatsNavigation selectedItem="googleMyBusiness" siteId={ siteId } slug={ siteSlug } />

					{ ! locationData && (
						<Notice
							status="is-error"
							showDismiss={ false }
							text={ translate( 'There is an error with your Google Business Profile account.' ) }
						>
							<NoticeAction href={ CALYPSO_CONTACT }>
								{ translate( 'Contact Support' ) }
							</NoticeAction>
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

					<div className="stats__gmb-location-wrapper">
						<GoogleMyBusinessLocation location={ locationData }>
							<Button
								href="https://business.google.com/"
								onClick={ this.trackUpdateListingClick }
								target="_blank"
							>
								{ translate( 'Update Listing' ) } <Gridicon icon="external" />
							</Button>
						</GoogleMyBusinessLocation>
					</div>

					{ this.renderStats() }
				</div>
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
