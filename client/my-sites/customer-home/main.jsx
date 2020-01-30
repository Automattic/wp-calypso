/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import page from 'page';
import { flowRight } from 'lodash';
import moment from 'moment';

/**
 * Internal dependencies
 */
import Banner from 'components/banner';
import { Button, Card } from '@automattic/components';
import CardHeading from 'components/card-heading';
import EmptyContent from 'components/empty-content';
import FoldableCard from 'components/foldable-card';
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
	isNewSite,
} from 'state/sites/selectors';
import { getDomainsBySiteId } from 'state/sites/domains/selectors';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import DocumentHead from 'components/data/document-head';
import getSiteChecklist from 'state/selectors/get-site-checklist';
import isSiteChecklistComplete from 'state/selectors/is-site-checklist-complete';
import QuerySiteChecklist from 'components/data/query-site-checklist';
import WpcomChecklist from 'my-sites/checklist/wpcom-checklist';
import withTrackingTool from 'lib/analytics/with-tracking-tool';
import { getGSuiteSupportedDomains } from 'lib/gsuite';
import { localizeUrl } from 'lib/i18n-utils';
import { isMobile } from 'lib/viewport';
import { launchSiteOrRedirectToLaunchSignupFlow } from 'state/sites/launch/actions';
import { bumpStat, composeAnalytics, recordTracksEvent } from 'state/analytics/actions';
import { expandMySitesSidebarSection as expandSection } from 'state/my-sites/sidebar/actions';
import isAtomicSite from 'state/selectors/is-site-automated-transfer';
import isSiteUsingFullSiteEditing from 'state/selectors/is-site-using-full-site-editing';
import StatsBanners from 'my-sites/stats/stats-banners';
import isUnlaunchedSite from 'state/selectors/is-unlaunched-site';
import { getActiveTheme, getCanonicalTheme } from 'state/themes/selectors';
import isSiteOnPaidPlan from 'state/selectors/is-site-on-paid-plan';
import { getCurrentUser, isCurrentUserEmailVerified } from 'state/current-user/selectors';
import QueryActiveTheme from 'components/data/query-active-theme';
import QueryCanonicalTheme from 'components/data/query-canonical-theme';
import GoMobileCard from 'my-sites/customer-home/go-mobile-card';
import StatsCard from './stats-card';
import isEligibleForDotcomChecklist from 'state/selectors/is-eligible-for-dotcom-checklist';

/**
 * Style dependencies
 */
import './style.scss';

/**
 * Image dependencies
 */
import commentIcon from 'assets/images/customer-home/comment.svg';
import customDomainIcon from 'assets/images/customer-home/custom-domain.svg';
import customizeIcon from 'assets/images/customer-home/customize.svg';
import gSuiteIcon from 'assets/images/customer-home/gsuite.svg';
import happinessIllustration from 'assets/images/customer-home/happiness.png';
import imagesIcon from 'assets/images/customer-home/images.svg';
import logoIcon from 'assets/images/customer-home/logo.svg';
import menuIcon from 'assets/images/customer-home/menus.svg';
import pageIcon from 'assets/images/customer-home/page.svg';
import postIcon from 'assets/images/customer-home/post.svg';
import themeIcon from 'assets/images/customer-home/theme.svg';

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

	getChecklistSubHeaderText = () => {
		const { checklistMode, currentTheme, translate, user } = this.props;

		switch ( checklistMode ) {
			case 'gsuite':
				return translate(
					'We emailed %(email)s with instructions to complete your G Suite setup. ' +
						'In the mean time, use this quick list of setup tasks to get your site ready to share.',
					{
						args: {
							email: user.email,
						},
					}
				);

			case 'concierge':
				return translate(
					'We emailed %(email)s with instructions to schedule your Quick Start Session call with us. ' +
						'In the mean time, use this quick list of setup tasks to get your site ready to share.',
					{
						args: {
							email: user.email,
						},
					}
				);

			case 'theme':
				return translate(
					'Your theme %(themeName)s by %(themeAuthor)s is now active on your site. ' +
						'Next, use this quick list of setup tasks to get it ready to share.',
					{
						args: {
							themeName: currentTheme && currentTheme.name,
							themeAuthor: currentTheme && currentTheme.author,
						},
					}
				);

			case 'launched':
				return translate( 'Make sure you share it with everyone and show it off.' );

			default:
				return translate(
					'Next, use this quick list of setup tasks to get your site ready to share.'
				);
		}
	};

	renderCustomerHomeHeader() {
		const {
			displayChecklist,
			isNewlyCreatedSite,
			translate,
			checklistMode,
			siteId,
			currentThemeId,
			siteIsUnlaunched,
			isAtomic,
		} = this.props;

		// Show a thank-you message 30 mins post site creation/purchase
		if ( isNewlyCreatedSite && displayChecklist ) {
			if ( siteIsUnlaunched || isAtomic ) {
				//Only show pre-launch, or for Atomic sites
				return (
					<>
						{ siteId && 'theme' === checklistMode && <QueryActiveTheme siteId={ siteId } /> }
						{ currentThemeId && (
							<QueryCanonicalTheme themeId={ currentThemeId } siteId={ siteId } />
						) }
						<img
							src="/calypso/images/signup/confetti.svg"
							aria-hidden="true"
							className="customer-home__confetti"
							alt=""
						/>
						<FormattedHeader
							headerText={
								this.props.siteHasPaidPlan
									? translate( 'Thank you for your purchase!' )
									: translate( 'Your site has been created!' )
							}
							subHeaderText={ this.getChecklistSubHeaderText() }
						/>
					</>
				);
			}
		}

		// Show a congratulatory message post-launch
		if ( ! siteIsUnlaunched && 'launched' === checklistMode ) {
			return (
				<>
					<img
						src="/calypso/images/signup/confetti.svg"
						aria-hidden="true"
						className="customer-home__confetti"
						alt=""
					/>
					<FormattedHeader
						headerText={ translate( 'You launched your site!' ) }
						subHeaderText={ this.getChecklistSubHeaderText() }
					/>
				</>
			);
		}

		// Show the standard heading otherwise
		return (
			<FormattedHeader
				headerText={ translate( 'My Home' ) }
				subHeaderText={ translate(
					'Your home base for all the posting, editing, and growing of your site'
				) }
				align="left"
			/>
		);
	}

	render() {
		const {
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
		const renderChecklistCompleteBanner = 'render' === this.state.renderChecklistCompleteBanner;

		return (
			<Main className="customer-home__main is-wide-layout">
				<PageViewTracker path={ `/home/:site` } title={ translate( 'Customer Home' ) } />
				<DocumentHead title={ translate( 'Customer Home' ) } />
				{ siteId && <QuerySiteChecklist siteId={ siteId } /> }
				<SidebarNavigation />
				<div className="customer-home__page-heading">{ this.renderCustomerHomeHeader() }</div>
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
				{ this.renderCustomerHome() }
			</Main>
		);
	}

	renderSiteTools() {
		const {
			displayChecklist,
			translate,
			customizeUrl,
			menusUrl,
			siteSlug,
			trackAction,
			isStaticHomePage,
			showCustomizer,
			hasCustomDomain,
		} = this.props;

		const siteTools = (
			<div className="customer-home__boxes">
				<ActionBox
					onClick={ () => {
						trackAction( 'my_site', 'add_page' );
						page( `/page/${ siteSlug }` );
					} }
					label={ translate( 'Add a page' ) }
					iconSrc={ pageIcon }
				/>
				{ isStaticHomePage ? (
					<ActionBox
						onClick={ () => {
							trackAction( 'my_site', 'write_post' );
							page( `/post/${ siteSlug }` );
						} }
						label={ translate( 'Write blog post' ) }
						iconSrc={ postIcon }
					/>
				) : (
					<ActionBox
						onClick={ () => {
							trackAction( 'my_site', 'manage_comments' );
							page( `/comments/${ siteSlug }` );
						} }
						label={ translate( 'Manage comments' ) }
						iconSrc={ commentIcon }
					/>
				) }
				{ showCustomizer && (
					<ActionBox
						href={ customizeUrl }
						onClick={ () => trackAction( 'my_site', 'customize_theme' ) }
						label={ translate( 'Customize theme' ) }
						iconSrc={ customizeIcon }
					/>
				) }
				<ActionBox
					onClick={ () => {
						trackAction( 'my_site', 'change_theme' );
						page( `/themes/${ siteSlug }` );
					} }
					label={ translate( 'Change theme' ) }
					iconSrc={ themeIcon }
				/>
				{ showCustomizer && (
					<ActionBox
						href={ menusUrl }
						onClick={ () => trackAction( 'my_site', 'edit_menus' ) }
						label={ translate( 'Edit menus' ) }
						iconSrc={ menuIcon }
					/>
				) }
				<ActionBox
					href={ `/media/${ siteSlug }` }
					onClick={ () => trackAction( 'my_site', 'change_images' ) }
					label={ translate( 'Change images' ) }
					iconSrc={ imagesIcon }
				/>
				<ActionBox
					href="https://wp.me/logo-maker"
					onClick={ () => trackAction( 'my_site', 'design_logo' ) }
					target="_blank"
					label={ translate( 'Design a logo' ) }
					iconSrc={ logoIcon }
				/>
				{ hasCustomDomain ? (
					<ActionBox
						onClick={ () => {
							trackAction( 'my_site', 'add_email' );
							page( `/email/${ siteSlug }` );
						} }
						label={ translate( 'Add email' ) }
						iconSrc={ gSuiteIcon }
					/>
				) : (
					<ActionBox
						onClick={ () => {
							trackAction( 'my_site', 'add_domain' );
							page( `/domains/add/${ siteSlug }` );
						} }
						label={ translate( 'Add a domain' ) }
						iconSrc={ customDomainIcon }
					/>
				) }
			</div>
		);
		if ( displayChecklist ) {
			return null;
		}
		return (
			<>
				{ ! isMobile() ? (
					<Card className="customer-home__card-boxes">
						<CardHeading>{ translate( 'Site Tools' ) }</CardHeading>
						{ siteTools }
					</Card>
				) : (
					<FoldableCard
						className="customer-home__card-boxes card-heading-21"
						header={ translate( 'Site Tools' ) }
						expanded
					>
						{ siteTools }
					</FoldableCard>
				) }
			</>
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
			site,
			siteSlug,
			trackAction,
			expandToolsAndTrack,
			isStaticHomePage,
			staticHomePageId,
			hasChecklistData,
			siteIsUnlaunched,
		} = this.props;
		const editHomePageUrl =
			isStaticHomePage && `/block-editor/page/${ siteSlug }/${ staticHomePageId }`;

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
					{ this.renderSiteTools() }
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
					{ ! siteIsUnlaunched && isChecklistComplete && (
						<Card>
							<CardHeading>{ translate( 'My Site' ) }</CardHeading>
							<h6 className="customer-home__card-subheader">
								{ translate( 'Make changes to your site or view its current state' ) }
							</h6>
							<div className="customer-home__card-col">
								<div className="customer-home__card-col-left">
									{ isStaticHomePage ? (
										<Button
											href={ editHomePageUrl }
											primary={ isPrimary }
											onClick={ () => trackAction( 'my_site', 'edit_homepage' ) }
										>
											{ translate( 'Edit Homepage' ) }
										</Button>
									) : (
										<Button
											href={ `/post/${ siteSlug }` }
											primary={ isPrimary }
											onClick={ () => {
												trackAction( 'my_site', 'write_post' );
											} }
										>
											{ translate( 'Write Blog Post' ) }
										</Button>
									) }
								</div>
								<div className="customer-home__card-col-right">
									<Button href={ site.URL } onClick={ () => trackAction( 'my_site', 'view_site' ) }>
										{ translate( 'View Site' ) }
									</Button>
								</div>
							</div>
						</Card>
					) }
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
	( state, { checklistMode } ) => {
		const siteId = getSelectedSiteId( state );
		const siteChecklist = getSiteChecklist( state, siteId );
		const hasChecklistData = null !== siteChecklist && Array.isArray( siteChecklist.tasks );
		const domains = getDomainsBySiteId( state, siteId );
		let themeInfo = {};
		if ( 'theme' === checklistMode ) {
			const currentThemeId = getActiveTheme( state, siteId );
			const currentTheme = currentThemeId && getCanonicalTheme( state, siteId, currentThemeId );
			themeInfo = { currentTheme, currentThemeId };
		}

		const isAtomic = isAtomicSite( state, siteId );
		const isChecklistComplete = isSiteChecklistComplete( state, siteId );
		const createdAt = getSiteOption( state, siteId, 'created_at' );

		return {
			displayChecklist:
				isEligibleForDotcomChecklist( state, siteId ) && hasChecklistData && ! isChecklistComplete,
			site: getSelectedSite( state ),
			siteId,
			siteSlug: getSelectedSiteSlug( state ),
			customizeUrl: getCustomizerUrl( state, siteId ),
			menusUrl: getCustomizerUrl( state, siteId, 'menus' ),
			canUserUseCustomerHome: canCurrentUserUseCustomerHome( state, siteId ),
			hasChecklistData,
			isChecklistComplete,
			isAtomic,
			needsEmailVerification: ! isCurrentUserEmailVerified( state ),
			isStaticHomePage: 'page' === getSiteOption( state, siteId, 'show_on_front' ),
			siteHasPaidPlan: isSiteOnPaidPlan( state, siteId ),
			isNewlyCreatedSite: isNewSite( state, siteId ),
			isEstablishedSite: moment().isAfter( moment( createdAt ).add( 2, 'days' ) ),
			siteIsUnlaunched: isUnlaunchedSite( state, siteId ),
			staticHomePageId: getSiteFrontPage( state, siteId ),
			showCustomizer: ! isSiteUsingFullSiteEditing( state, siteId ),
			hasCustomDomain: getGSuiteSupportedDomains( domains ).length > 0,
			user: getCurrentUser( state ),
			...themeInfo,
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
