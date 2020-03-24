/**
 * External dependencies
 */
import { isMobile } from '@automattic/viewport';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { flowRight } from 'lodash';
import moment from 'moment';

/**
 * Internal dependencies
 */
import { Button, Card } from '@automattic/components';
import CardHeading from 'components/card-heading';
import EmptyContent from 'components/empty-content';
import Main from 'components/main';
import VerticalNav from 'components/vertical-nav';
import VerticalNavItem from 'components/vertical-nav/item';
import { preventWidows } from 'lib/formatting';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import FormattedHeader from 'components/formatted-header';
import { SIDEBAR_SECTION_TOOLS } from 'my-sites/sidebar/constants';
import { getSelectedSite, getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { canCurrentUserUseCustomerHome, getSiteOption } from 'state/sites/selectors';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import DocumentHead from 'components/data/document-head';
import getSiteChecklist from 'state/selectors/get-site-checklist';
import isSiteChecklistComplete from 'state/selectors/is-site-checklist-complete';
import QuerySiteChecklist from 'components/data/query-site-checklist';
import WpcomChecklist from 'my-sites/checklist/wpcom-checklist';
import withTrackingTool from 'lib/analytics/with-tracking-tool';
import { localizeUrl } from 'lib/i18n-utils';
import { launchSiteOrRedirectToLaunchSignupFlow } from 'state/sites/launch/actions';
import { bumpStat, composeAnalytics, recordTracksEvent } from 'state/analytics/actions';
import { expandMySitesSidebarSection as expandSection } from 'state/my-sites/sidebar/actions';
import isAtomicSite from 'state/selectors/is-site-automated-transfer';
import StatsBanners from 'my-sites/stats/stats-banners';
import isUnlaunchedSite from 'state/selectors/is-unlaunched-site';
import { getCurrentUser, isCurrentUserEmailVerified } from 'state/current-user/selectors';
import GoMobileCard from 'my-sites/customer-home/go-mobile-card';
import StatsCard from './stats-card';
import FreePhotoLibraryCard from './free-photo-library-card';
import isEligibleForDotcomChecklist from 'state/selectors/is-eligible-for-dotcom-checklist';
import { getSelectedEditor } from 'state/selectors/get-selected-editor';
import QuickLinks from 'my-sites/customer-home/quick-links';
import Notices from 'my-sites/customer-home/notices';
import QueryHomeLayout from 'components/data/query-home-layout';
import { getHomeLayout } from 'state/selectors/get-home-layout';

/**
 * Style dependencies
 */
import './style.scss';

/**
 * Image dependencies
 */
import happinessIllustration from 'assets/images/customer-home/happiness.png';

class Home extends Component {
	static propTypes = {
		checklistMode: PropTypes.string,

		site: PropTypes.object.isRequired,
		siteId: PropTypes.number.isRequired,
		siteSlug: PropTypes.string.isRequired,
		canUserUseCustomerHome: PropTypes.bool.isRequired,
		hasChecklistData: PropTypes.bool.isRequired,
		isChecklistComplete: function( props, propName, componentName ) {
			const propValue = props[ propName ]; // the actual value of `isChecklistComplete`
			if ( null !== propValue && 'boolean' !== typeof propValue ) {
				return new Error(
					`isChecklistComplete prop of ${ componentName } only accepts null or Boolean.`
				);
			}
		},
		expandToolsAndTrack: PropTypes.func.isRequired,
		trackAction: PropTypes.func.isRequired,
		isStaticHomePage: PropTypes.bool.isRequired,
	};

	onLaunchBannerClick = e => {
		const { siteId } = this.props;
		e.preventDefault();

		this.props.launchSiteOrRedirectToLaunchSignupFlow( siteId );
	};

	renderCustomerHomeHeader() {
		const { translate, site, siteIsUnlaunched, trackAction } = this.props;

		return (
			<>
				<div className="customer-home__heading">
					<FormattedHeader
						headerText={ translate( 'My Home' ) }
						subHeaderText={ translate(
							'Your home base for all the posting, editing, and growing of your site'
						) }
						align="left"
					/>
					{ ! siteIsUnlaunched && (
						<div className="customer-home__view-site-button">
							<Button href={ site.URL } onClick={ () => trackAction( 'my_site', 'view_site' ) }>
								{ translate( 'View site' ) }
							</Button>
						</div>
					) }
				</div>
			</>
		);
	}

	render() {
		const {
			checklistMode,
			translate,
			canUserUseCustomerHome,
			siteSlug,
			siteId,
			isChecklistComplete,
			siteIsUnlaunched,
			isEstablishedSite,
		} = this.props;

		if ( ! canUserUseCustomerHome ) {
			const title = translate( 'This page is not available on this site.' );
			return (
				<EmptyContent
					title={ preventWidows( title ) }
					illustration="/calypso/images/illustrations/error.svg"
				/>
			);
		}

		return (
			<Main className="customer-home__main is-wide-layout">
				<PageViewTracker path={ `/home/:site` } title={ translate( 'My Home' ) } />
				<DocumentHead title={ translate( 'My Home' ) } />
				{ siteId && <QuerySiteChecklist siteId={ siteId } /> }
				{ siteId && <QueryHomeLayout siteId={ siteId } /> }
				<SidebarNavigation />
				<div className="customer-home__page-heading">{ this.renderCustomerHomeHeader() }</div>
				<Notices checklistMode={ checklistMode } />
				{ //Only show upgrade nudges to sites > 2 days old
				isEstablishedSite && (
					<div className="customer-home__upsells">
						<StatsBanners
							siteId={ siteId }
							slug={ siteSlug }
							primaryButton={ isChecklistComplete && ! siteIsUnlaunched ? true : false }
						/>
					</div>
				) }
				{ this.renderCustomerHome() }
			</Main>
		);
	}

	renderCustomerHome = () => {
		const {
			displayChecklist,
			isAtomic,
			isChecklistComplete,
			needsEmailVerification,
			translate,
			checklistMode,
			siteSlug,
			trackAction,
			expandToolsAndTrack,
			hasChecklistData,
			siteIsUnlaunched,
		} = this.props;

		if ( ! hasChecklistData ) {
			return <div className="customer-home__loading-placeholder"></div>;
		}

		const isPrimary = ! isAtomic && isChecklistComplete;

		return (
			<div className="customer-home__layout">
				<div className="customer-home__layout-col customer-home__layout-col-left">
					{ // "Go Mobile" has the highest priority placement when viewed in smaller viewports, so folks
					// can see it on their phone without needing to scroll.
					isMobile() && <GoMobileCard /> }
					{ displayChecklist && (
						<>
							<Card className="customer-home__card-checklist-heading">
								<CardHeading>{ translate( 'Site Setup List' ) }</CardHeading>
							</Card>
							<WpcomChecklist displayMode={ checklistMode } />
						</>
					) }
					{ ! displayChecklist && <QuickLinks /> }
				</div>
				<div className="customer-home__layout-col customer-home__layout-col-right">
					{ siteIsUnlaunched && ! needsEmailVerification && (
						<Card className="customer-home__launch-button">
							<CardHeading>{ translate( 'Site Privacy' ) }</CardHeading>
							<h6 className="customer-home__card-subheader">
								{ translate( 'Your site is private' ) }
							</h6>
							<p>
								{ translate(
									'Only you and those you invite can view your site. Launch your site to make it visible to the public.'
								) }
							</p>
							<Button primary={ isPrimary } onClick={ this.onLaunchBannerClick }>
								{ translate( 'Launch my site' ) }
							</Button>
						</Card>
					) }
					{ ! siteIsUnlaunched && <StatsCard /> }
					{ <FreePhotoLibraryCard /> }
					{ ! siteIsUnlaunched && isChecklistComplete && (
						<Card className="customer-home__grow-earn">
							<CardHeading>{ translate( 'Grow & Earn' ) }</CardHeading>
							<h6 className="customer-home__card-subheader">
								{ translate( 'Grow your audience and earn money' ) }
							</h6>
							<VerticalNav className="customer-home__card-links">
								<VerticalNavItem
									path={ `/marketing/connections/${ siteSlug }` }
									onClick={ () => expandToolsAndTrack( 'earn', 'share_site' ) }
								>
									{ translate( 'Share my site' ) }
								</VerticalNavItem>
								<VerticalNavItem
									path={ `/marketing/tools/${ siteSlug }` }
									onClick={ () => expandToolsAndTrack( 'earn', 'grow_audience' ) }
								>
									{ translate( 'Grow my audience' ) }
								</VerticalNavItem>
								<VerticalNavItem
									path={ `/earn/${ siteSlug }` }
									onClick={ () => expandToolsAndTrack( 'earn', 'money' ) }
								>
									{ translate( 'Earn money' ) }
								</VerticalNavItem>
							</VerticalNav>
						</Card>
					) }
					<Card>
						<CardHeading>{ translate( 'Support' ) }</CardHeading>
						<h6 className="customer-home__card-subheader">
							{ translate( 'Get all the help you need' ) }
						</h6>
						<div className="customer-home__card-support">
							<img src={ happinessIllustration } alt={ translate( 'Support' ) } />
							<VerticalNav className="customer-home__card-links">
								<VerticalNavItem
									path={ localizeUrl( 'https://en.support.wordpress.com' ) }
									external
									onClick={ () => trackAction( 'support', 'docs' ) }
								>
									{ translate( 'Support articles' ) }
								</VerticalNavItem>
								<VerticalNavItem
									path="/help/contact"
									external
									onClick={ () => trackAction( 'support', 'contact' ) }
								>
									{ translate( 'Contact us' ) }
								</VerticalNavItem>
							</VerticalNav>
						</div>
					</Card>
					{ // "Go Mobile" has the lowest priority placement when viewed in bigger viewports.
					! isMobile() && <GoMobileCard /> }
				</div>
			</div>
		);
	};
}

const connectHome = connect(
	state => {
		const siteId = getSelectedSiteId( state );
		const siteChecklist = getSiteChecklist( state, siteId );
		const hasChecklistData = null !== siteChecklist && Array.isArray( siteChecklist.tasks );
		const isAtomic = isAtomicSite( state, siteId );
		const isChecklistComplete = isSiteChecklistComplete( state, siteId );
		const createdAt = getSiteOption( state, siteId, 'created_at' );
		const user = getCurrentUser( state );
		const isClassicEditor = getSelectedEditor( state, siteId ) === 'classic';

		return {
			displayChecklist:
				isEligibleForDotcomChecklist( state, siteId ) && hasChecklistData && ! isChecklistComplete,
			site: getSelectedSite( state ),
			siteId,
			siteSlug: getSelectedSiteSlug( state ),
			canUserUseCustomerHome: canCurrentUserUseCustomerHome( state, siteId ),
			hasChecklistData,
			isChecklistComplete,
			isAtomic,
			needsEmailVerification: ! isCurrentUserEmailVerified( state ),
			isStaticHomePage:
				! isClassicEditor && 'page' === getSiteOption( state, siteId, 'show_on_front' ),
			isEstablishedSite: moment().isAfter( moment( createdAt ).add( 2, 'days' ) ),
			siteIsUnlaunched: isUnlaunchedSite( state, siteId ),
			user,
			cards: getHomeLayout( state, siteId ),
		};
	},
	dispatch => ( {
		trackAction: ( section, action, isStaticHomePage ) =>
			dispatch(
				composeAnalytics(
					recordTracksEvent( `calypso_customer_home_${ section }_${ action }_click`, {
						is_static_home_page: isStaticHomePage,
					} ),
					bumpStat( 'calypso_customer_home', `${ section }_${ action }` )
				)
			),
		expandToolsSection: () => dispatch( expandSection( SIDEBAR_SECTION_TOOLS ) ),
		launchSiteOrRedirectToLaunchSignupFlow: siteId =>
			dispatch( launchSiteOrRedirectToLaunchSignupFlow( siteId ) ),
	} ),
	( stateProps, dispatchProps, ownProps ) => ( {
		...stateProps,
		...ownProps,
		launchSiteOrRedirectToLaunchSignupFlow: () =>
			dispatchProps.launchSiteOrRedirectToLaunchSignupFlow( stateProps.siteId ),
		expandToolsAndTrack: ( section, action ) => {
			dispatchProps.expandToolsSection();
			dispatchProps.trackAction( section, action, stateProps.isStaticHomePage );
		},
		trackAction: ( section, action ) =>
			dispatchProps.trackAction( section, action, stateProps.isStaticHomePage ),
	} )
);

export default flowRight( connectHome, localize, withTrackingTool( 'HotJar' ) )( Home );
