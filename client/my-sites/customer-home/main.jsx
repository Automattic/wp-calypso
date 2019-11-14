/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import page from 'page';
import { flowRight } from 'lodash';

/**
 * Internal dependencies
 */
import AppsBadge from 'blocks/get-apps/apps-badge';
import Banner from 'components/banner';
import Button from 'components/button';
import Card from 'components/card';
import CardHeading from 'components/card-heading';
import EmptyContent from 'components/empty-content';
import ChecklistWpcom from 'my-sites/checklist/main';
import Main from 'components/main';
import VerticalNav from 'components/vertical-nav';
import VerticalNavItem from 'components/vertical-nav/item';
import { preventWidows } from 'lib/formatting';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import FormattedHeader from 'components/formatted-header';
import { SIDEBAR_SECTION_TOOLS } from 'my-sites/sidebar/constants';
import { getSelectedSite, getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import {
	canCurrentUserUseCustomerHome,
	getSiteFrontPage,
	getCustomizerUrl,
	getSiteOption,
} from 'state/sites/selectors';
import { getDomainsBySiteId } from 'state/sites/domains/selectors';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import DocumentHead from 'components/data/document-head';
import getSiteChecklist from 'state/selectors/get-site-checklist';
import isSiteChecklistComplete from 'state/selectors/is-site-checklist-complete';
import QuerySiteChecklist from 'components/data/query-site-checklist';
import withTrackingTool from 'lib/analytics/with-tracking-tool';
import { getGSuiteSupportedDomains } from 'lib/gsuite';
import { launchSiteOrRedirectToLaunchSignupFlow } from 'state/sites/launch/actions';
import { bumpStat, composeAnalytics, recordTracksEvent } from 'state/analytics/actions';
import { expandMySitesSidebarSection as expandSection } from 'state/my-sites/sidebar/actions';
import isAtomicSite from 'state/selectors/is-site-automated-transfer';
import isSiteUsingFullSiteEditing from 'state/selectors/is-site-using-full-site-editing';
import StatsBanners from 'my-sites/stats/stats-banners';
import isUnlaunchedSite from 'state/selectors/is-unlaunched-site';

/**
 * Style dependencies
 */
import './style.scss';

const ActionBox = ( { href, onClick, target, iconSrc, label } ) => {
	const buttonAction = { href, onClick, target };
	return (
		<div className="customer-home__box-action">
			<Button { ...buttonAction }>
				<img src={ iconSrc } alt="" />
				<span>{ label }</span>
			</Button>
		</div>
	);
};

class Home extends Component {
	static propTypes = {
		checklistMode: PropTypes.string,

		site: PropTypes.object.isRequired,
		siteId: PropTypes.number.isRequired,
		siteSlug: PropTypes.string.isRequired,
		customizeUrl: PropTypes.string.isRequired,
		menusUrl: PropTypes.string.isRequired,
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
		staticHomePageId: PropTypes.number, // this is unused if isStaticHomePage is false. In such case, it's null.
	};

	state = {
		renderChecklistCompleteBanner: null,
	};

	static getDerivedStateFromProps( nextProps, prevState ) {
		// If we still don't have checklist data or we don't want to render the banner, probably because
		// this is a page load, don't change the state.
		if (
			null === nextProps.isChecklistComplete ||
			'norender' === prevState.renderChecklistCompleteBanner
		) {
			return null;
		}
		// If this state prop doesn't have a value yet
		if ( null === prevState.renderChecklistCompleteBanner ) {
			return {
				// Set to norender because this is the initial state value and the checklist is completed.
				// Otherwise the banner will always display once the checklist is completed, even on page load.
				renderChecklistCompleteBanner: nextProps.isChecklistComplete ? 'norender' : 'waiting', // If checklist is not complete, let's flag it and wait until it is.
			};
		}
		// If we're here, this is not a page load, so let's check if the checklist was completed.
		if ( nextProps.isChecklistComplete ) {
			return {
				renderChecklistCompleteBanner: 'render',
			};
		}
		return null;
	}

	onLaunchBannerClick = e => {
		const { siteId } = this.props;
		e.preventDefault();

		this.props.launchSiteOrRedirectToLaunchSignupFlow( siteId );
	};

	render() {
		const { translate, canUserUseCustomerHome, siteSlug } = this.props;

		if ( ! canUserUseCustomerHome ) {
			const title = translate( 'This page is not available on this site.' );
			return (
				<EmptyContent
					title={ preventWidows( title ) }
					illustration="/calypso/images/illustrations/error.svg"
				/>
			);
		}

		const { siteId, hasChecklistData, isChecklistComplete, siteIsUnlaunched } = this.props;
		const renderChecklistCompleteBanner = 'render' === this.state.renderChecklistCompleteBanner;

		return (
			<Main className="customer-home__main is-wide-layout">
				<PageViewTracker path={ `/home/:site` } title={ translate( 'Customer Home' ) } />
				<DocumentHead title={ translate( 'Customer Home' ) } />
				<SidebarNavigation />
				<FormattedHeader
					className="customer-home__page-heading"
					headerText={ translate( 'Welcome' ) }
					subHeaderText={ translate( 'Your website on WordPress.com.' ) }
					align="left"
				/>
				<StatsBanners siteId={ siteId } slug={ siteSlug } />
				{ renderChecklistCompleteBanner && (
					<Banner
						dismissPreferenceName="checklist-complete"
						dismissTemporary={ true }
						icon="checkmark"
						disableHref
						title={ translate( 'Congratulations!' ) }
						description={ translate( "You've completed each item in your checklist." ) }
					/>
				) }
				{ hasChecklistData && isChecklistComplete && siteIsUnlaunched && (
					<Banner
						dismissPreferenceName="customer-home-unlaunched-reminder"
						dismissTemporary={ true }
						icon="info"
						title={ translate( 'Your site is private' ) }
						description={ translate(
							'Only you and those you invite can view your site. Launch your site to make it visible to the public.'
						) }
					/>
				) }

				{ this.renderCustomerHome() }
			</Main>
		);
	}

	renderCustomerHome = () => {
		const {
			isAtomic,
			isChecklistComplete,
			translate,
			customizeUrl,
			checklistMode,
			menusUrl,
			site,
			siteSlug,
			trackAction,
			expandToolsAndTrack,
			isStaticHomePage,
			staticHomePageId,
			showCustomizer,
			hasCustomDomain,
			hasChecklistData,
			siteId,
			siteIsUnlaunched,
		} = this.props;
		const editHomePageUrl =
			isStaticHomePage && `/block-editor/page/${ siteSlug }/${ staticHomePageId }`;

		/* For now we are hiding the checklist on Atomic sites see pb5gDS-7c-p2 for more information */
		const displayChecklist = hasChecklistData && ! isAtomic && ! isChecklistComplete;

		return (
			<div className="customer-home__layout">
				<div className="customer-home__layout-col customer-home__layout-col-left">
					{ siteId && ! hasChecklistData && <QuerySiteChecklist siteId={ siteId } /> }
					{ displayChecklist ? (
						<Card>
							<ChecklistWpcom displayMode={ checklistMode } />
						</Card>
					) : (
						<>
							<Card>
								<CardHeading>{ translate( 'My Site' ) }</CardHeading>
								<h6 className="customer-home__card-subheader">
									{ translate( 'Review and update my site' ) }
								</h6>
								<div className="customer-home__card-col">
									<div className="customer-home__card-col-left">
										<Button
											href={ site.URL }
											primary
											onClick={ () => trackAction( 'my_site', 'view_site' ) }
										>
											{ translate( 'View Site' ) }
										</Button>
									</div>
									<div className="customer-home__card-col-right">
										{ isStaticHomePage ? (
											<Button
												href={ editHomePageUrl }
												onClick={ () => trackAction( 'my_site', 'edit_homepage' ) }
											>
												{ translate( 'Edit Homepage' ) }
											</Button>
										) : (
											<Button
												onClick={ () => {
													trackAction( 'my_site', 'write_post' );
													page( `/post/${ siteSlug }` );
												} }
											>
												{ translate( 'Write Blog Post' ) }
											</Button>
										) }
									</div>
								</div>
							</Card>
							<Card className="customer-home__card-boxes">
								<div className="customer-home__boxes">
									<ActionBox
										onClick={ () => {
											trackAction( 'my_site', 'add_page' );
											page( `/page/${ siteSlug }` );
										} }
										label={ translate( 'Add a page' ) }
										iconSrc="/calypso/images/customer-home/page.svg"
									/>
									{ isStaticHomePage ? (
										<ActionBox
											onClick={ () => {
												trackAction( 'my_site', 'write_post' );
												page( `/post/${ siteSlug }` );
											} }
											label={ translate( 'Write blog post' ) }
											iconSrc="/calypso/images/customer-home/post.svg"
										/>
									) : (
										<ActionBox
											onClick={ () => {
												trackAction( 'my_site', 'manage_comments' );
												page( `/comments/${ siteSlug }` );
											} }
											label={ translate( 'Manage comments' ) }
											iconSrc="/calypso/images/customer-home/comment.svg"
										/>
									) }
									{ showCustomizer && (
										<ActionBox
											href={ customizeUrl }
											onClick={ () => trackAction( 'my_site', 'customize_theme' ) }
											label={ translate( 'Customize theme' ) }
											iconSrc="/calypso/images/customer-home/customize.svg"
										/>
									) }
									<ActionBox
										onClick={ () => {
											trackAction( 'my_site', 'change_theme' );
											page( `/themes/${ siteSlug }` );
										} }
										label={ translate( 'Change theme' ) }
										iconSrc="/calypso/images/customer-home/theme.svg"
									/>
									{ showCustomizer && (
										<ActionBox
											href={ menusUrl }
											onClick={ () => trackAction( 'my_site', 'edit_menus' ) }
											label={ translate( 'Edit menus' ) }
											iconSrc="/calypso/images/customer-home/menus.svg"
										/>
									) }
									<ActionBox
										href={ `/media/${ siteSlug }` }
										onClick={ () => trackAction( 'my_site', 'change_images' ) }
										label={ translate( 'Change images' ) }
										iconSrc="/calypso/images/customer-home/images.svg"
									/>
									<ActionBox
										href="https://wp.me/logo-maker"
										onClick={ () => trackAction( 'my_site', 'design_logo' ) }
										target="_blank"
										label={ translate( 'Design a logo' ) }
										iconSrc="/calypso/images/customer-home/logo.svg"
									/>
									{ hasCustomDomain ? (
										<ActionBox
											onClick={ () => {
												trackAction( 'my_site', 'add_email' );
												page( `/email/${ siteSlug }` );
											} }
											label={ translate( 'Add email' ) }
											iconSrc="/calypso/images/customer-home/gsuite.svg"
										/>
									) : (
										<ActionBox
											onClick={ () => {
												trackAction( 'my_site', 'add_domain' );
												page( `/domains/add/${ siteSlug }` );
											} }
											label={ translate( 'Add a domain' ) }
											iconSrc="/calypso/images/customer-home/custom-domain.svg"
										/>
									) }
								</div>
							</Card>
						</>
					) }
				</div>
				<div className="customer-home__layout-col customer-home__layout-col-right">
					{ siteIsUnlaunched && (
						<Card className="customer-home__launch-button">
							<Button primary onClick={ this.onLaunchBannerClick }>
								{ translate( 'Launch my site' ) }
							</Button>
						</Card>
					) }
					<Card className="customer-home__grow-earn">
						<CardHeading>{ translate( 'Grow & Earn' ) }</CardHeading>
						<h6 className="customer-home__card-subheader">
							{ translate( 'Grow my audience and earn money' ) }
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
					<Card>
						<CardHeading>{ translate( 'Support' ) }</CardHeading>
						<h6 className="customer-home__card-subheader">
							{ translate( 'Get all the help you need' ) }
						</h6>
						<div className="customer-home__card-support">
							<img
								src="/calypso/images/customer-home/happiness.png"
								alt={ translate( 'Support' ) }
							/>
							<VerticalNav className="customer-home__card-links">
								<VerticalNavItem
									path="https://en.support.wordpress.com/"
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
					<Card className="customer-home__go-mobile">
						<CardHeading>{ translate( 'Go Mobile' ) }</CardHeading>
						<h6 className="customer-home__card-subheader">
							{ translate( 'Make updates on the go' ) }
						</h6>
						<div className="customer-home__card-button-pair customer-home__card-mobile">
							<AppsBadge
								storeLink="https://apps.apple.com/app/apple-store/id335703880?pt=299112&ct=calypso-customer-home&mt=8"
								storeName={ 'ios' }
								titleText={ translate( 'Download the WordPress iOS mobile app.' ) }
								altText={ translate( 'Apple App Store download badge' ) }
							>
								<img src="/calypso/images/customer-home/apple-store.png" alt="" />
							</AppsBadge>
							<AppsBadge
								storeLink="https://play.google.com/store/apps/details?id=org.wordpress.android&referrer=utm_source%3Dcalypso-customer-home%26utm_medium%3Dweb%26utm_campaign%3Dmobile-download-promo-pages"
								storeName={ 'android' }
								titleText={ translate( 'Download the WordPress Android mobile app.' ) }
								altText={ translate( 'Google Play Store download badge' ) }
							>
								<img src="/calypso/images/customer-home/google-play.png" alt="" />
							</AppsBadge>
						</div>
					</Card>
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
		const domains = getDomainsBySiteId( state, siteId );

		return {
			site: getSelectedSite( state ),
			siteId,
			siteSlug: getSelectedSiteSlug( state ),
			customizeUrl: getCustomizerUrl( state, siteId ),
			menusUrl: getCustomizerUrl( state, siteId, 'menus' ),
			canUserUseCustomerHome: canCurrentUserUseCustomerHome( state, siteId ),
			hasChecklistData,
			isChecklistComplete: isSiteChecklistComplete( state, siteId ),
			isAtomic: isAtomicSite( state, siteId ),
			isStaticHomePage: 'page' === getSiteOption( state, siteId, 'show_on_front' ),
			siteIsUnlaunched: isUnlaunchedSite( state, siteId ),
			staticHomePageId: getSiteFrontPage( state, siteId ),
			showCustomizer: ! isSiteUsingFullSiteEditing( state, siteId ),
			hasCustomDomain: getGSuiteSupportedDomains( domains ).length > 0,
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
