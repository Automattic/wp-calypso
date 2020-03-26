/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import { Card } from '@automattic/components';
import { isMobile } from '@automattic/viewport';

/**
 * Internal dependencies
 */
import CardHeading from 'components/card-heading';
import FoldableCard from 'components/foldable-card';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import {
	getSiteFrontPage,
	getCustomizerUrl,
	getSiteOption,
	isNewSite,
} from 'state/sites/selectors';
import { getSelectedEditor } from 'state/selectors/get-selected-editor';
import isSiteUsingFullSiteEditing from 'state/selectors/is-site-using-full-site-editing';
import { getGSuiteSupportedDomains } from 'lib/gsuite';
import { getDomainsBySiteId } from 'state/sites/domains/selectors';
import { navigate } from 'state/ui/actions';
import {
	bumpStat,
	composeAnalytics,
	recordTracksEvent,
	withAnalytics,
} from 'state/analytics/actions';
import ActionBox from './action-box';

/**
 * Image dependencies
 */
import commentIcon from 'assets/images/customer-home/comment.svg';
import customDomainIcon from 'assets/images/customer-home/custom-domain.svg';
import customizeIcon from 'assets/images/customer-home/customize.svg';
import gSuiteIcon from 'assets/images/customer-home/gsuite.svg';
import homepageIcon from 'assets/images/customer-home/homepage.svg';
import logoIcon from 'assets/images/customer-home/looka-logo.svg';
import menuIcon from 'assets/images/customer-home/menus.svg';
import pageIcon from 'assets/images/customer-home/page.svg';
import postIcon from 'assets/images/customer-home/post.svg';
import themeIcon from 'assets/images/customer-home/theme.svg';

/**
 * Style dependencies
 */
import './style.scss';

export const QuickLinks = ( {
	customizeUrl,
	isStaticHomePage,
	showCustomizer,
	hasCustomDomain,
	menusUrl,
	editHomepageAction,
	writePostAction,
	addPageAction,
	manageCommentsAction,
	trackEditMenusAction,
	trackCustomizeThemeAction,
	changeThemeAction,
	trackDesignLogoAction,
	addEmailAction,
	addDomainAction,
} ) => {
	const translate = useTranslate();

	const quickLinks = (
		<div className="quick-links__boxes">
			{ isStaticHomePage ? (
				<ActionBox
					onClick={ editHomepageAction }
					label={ translate( 'Edit homepage' ) }
					subtitle={ translate( 'Create an eyecatching design with the new Block Editor.' ) }
					iconSrc={ homepageIcon }
				/>
			) : (
				<ActionBox
					onClick={ writePostAction }
					label={ translate( 'Write blog post' ) }
					subtitle={ translate( 'Sites that publish content regularly get more traffic.' ) }
					iconSrc={ postIcon }
				/>
			) }
			{ isStaticHomePage ? (
				<ActionBox
					onClick={ addPageAction }
					label={ translate( 'Add a page' ) }
					subtitle={ translate( 'Create a new page with the default template.' ) }
					iconSrc={ pageIcon }
				/>
			) : (
				<ActionBox
					onClick={ manageCommentsAction }
					label={ translate( 'Manage comments' ) }
					subtitle={ translate( 'View, approve, and reply to comments on your posts and pages.' ) }
					iconSrc={ commentIcon }
				/>
			) }
			{ isStaticHomePage ? (
				<ActionBox
					onClick={ writePostAction }
					label={ translate( 'Write blog post' ) }
					subtitle={ translate( 'Sites that publish content regularly get more traffic.' ) }
					iconSrc={ postIcon }
				/>
			) : (
				<ActionBox
					onClick={ addPageAction }
					label={ translate( 'Add a page' ) }
					subtitle={ translate( 'Create a new page with the default template.' ) }
					iconSrc={ pageIcon }
				/>
			) }
			{ showCustomizer && (
				<ActionBox
					href={ menusUrl }
					onClick={ trackEditMenusAction }
					label={ translate( 'Edit menus' ) }
					subtitle={ translate( 'Help visitors easily navigate your site.' ) }
					iconSrc={ menuIcon }
				/>
			) }
			{ showCustomizer && (
				<ActionBox
					href={ customizeUrl }
					onClick={ trackCustomizeThemeAction }
					label={ translate( 'Customize theme' ) }
					subtitle={ translate( "Change your site's colors, fonts, branding, and more." ) }
					iconSrc={ customizeIcon }
				/>
			) }
			<ActionBox
				onClick={ changeThemeAction }
				label={ translate( 'Change theme' ) }
				subtitle={ translate( 'Browse available themes to find the perfect one.' ) }
				iconSrc={ themeIcon }
			/>
			{ hasCustomDomain ? (
				<ActionBox
					onClick={ addEmailAction }
					label={ translate( 'Add email' ) }
					subtitle={ translate( 'Send and receive email using your custom domain.' ) }
					iconSrc={ gSuiteIcon }
				/>
			) : (
				<ActionBox
					onClick={ addDomainAction }
					label={ translate( 'Connect a domain' ) }
					subtitle={ translate( 'Sites with custom domains look more professional.' ) }
					iconSrc={ customDomainIcon }
				/>
			) }
			<ActionBox
				href="https://wp.me/logo-maker"
				onClick={ trackDesignLogoAction }
				target="_blank"
				label={ translate( 'Create a logo with Looka' ) }
				subtitle={ translate( 'Get an instant logo for your site or business with Looka.' ) }
				external
				iconSrc={ logoIcon }
			/>
		</div>
	);

	if ( ! isMobile() ) {
		return (
			<Card className="quick-links">
				<CardHeading>{ translate( 'Quick Links' ) }</CardHeading>
				{ quickLinks }
			</Card>
		);
	}
	return (
		<FoldableCard
			className="quick-links card-heading-21"
			header={ translate( 'Quick Links' ) }
			expanded
		>
			{ quickLinks }
		</FoldableCard>
	);
};

const editHomepageAction = ( editHomePageUrl, isStaticHomePage ) =>
	withAnalytics(
		composeAnalytics(
			recordTracksEvent( 'calypso_customer_home_my_site_edit_homepage_click', {
				is_static_home_page: isStaticHomePage,
			} ),
			bumpStat( 'calypso_customer_home', 'my_site_edit_homepage' )
		),
		navigate( editHomePageUrl )
	);

const writePostAction = ( siteSlug, isStaticHomePage ) =>
	withAnalytics(
		composeAnalytics(
			recordTracksEvent( 'calypso_customer_home_my_site_write_post_click', {
				is_static_home_page: isStaticHomePage,
			} ),
			bumpStat( 'calypso_customer_home', 'my_site_write_post' )
		),
		navigate( `/post/${ siteSlug }` )
	);

const addPageAction = ( siteSlug, isStaticHomePage ) =>
	withAnalytics(
		composeAnalytics(
			recordTracksEvent( 'calypso_customer_home_my_site_add_page_click', {
				is_static_home_page: isStaticHomePage,
			} ),
			bumpStat( 'calypso_customer_home', 'my_site_add_page' )
		),
		navigate( `/page/${ siteSlug }` )
	);

const manageCommentsAction = ( siteSlug, isStaticHomePage ) =>
	withAnalytics(
		composeAnalytics(
			recordTracksEvent( 'calypso_customer_home_my_site_manage_comments_click', {
				is_static_home_page: isStaticHomePage,
			} ),
			bumpStat( 'calypso_customer_home', 'my_site_manage_comments' )
		),
		navigate( `/comments/${ siteSlug }` )
	);

const trackEditMenusAction = isStaticHomePage =>
	composeAnalytics(
		recordTracksEvent( 'calypso_customer_home_my_site_edit_menus_click', {
			is_static_home_page: isStaticHomePage,
		} ),
		bumpStat( 'calypso_customer_home', 'my_site_edit_menus' )
	);

const trackCustomizeThemeAction = isStaticHomePage =>
	composeAnalytics(
		recordTracksEvent( 'calypso_customer_home_my_site_customize_theme_click', {
			is_static_home_page: isStaticHomePage,
		} ),
		bumpStat( 'calypso_customer_home', 'my_site_customize_theme' )
	);

const changeThemeAction = ( siteSlug, isStaticHomePage ) =>
	withAnalytics(
		composeAnalytics(
			recordTracksEvent( 'calypso_customer_home_my_site_change_theme_click', {
				is_static_home_page: isStaticHomePage,
			} ),
			bumpStat( 'calypso_customer_home', 'my_site_change_theme' )
		),
		navigate( `/themes/${ siteSlug }` )
	);

const trackDesignLogoAction = isStaticHomePage =>
	composeAnalytics(
		recordTracksEvent( 'calypso_customer_home_my_site_design_logo_click', {
			is_static_home_page: isStaticHomePage,
		} ),
		bumpStat( 'calypso_customer_home', 'my_site_design_logo' )
	);

const addEmailAction = ( siteSlug, isStaticHomePage ) =>
	withAnalytics(
		composeAnalytics(
			recordTracksEvent( 'calypso_customer_home_my_site_add_email_click', {
				is_static_home_page: isStaticHomePage,
			} ),
			bumpStat( 'calypso_customer_home', 'my_site_add_email' )
		),
		navigate( `/email/${ siteSlug }` )
	);

const addDomainAction = ( siteSlug, isStaticHomePage ) =>
	withAnalytics(
		composeAnalytics(
			recordTracksEvent( 'calypso_customer_home_my_site_add_domain_click', {
				is_static_home_page: isStaticHomePage,
			} ),
			bumpStat( 'calypso_customer_home', 'my_site_add_domain' )
		),
		navigate( `/domains/add/${ siteSlug }` )
	);

const mapStateToProps = state => {
	const siteId = getSelectedSiteId( state );
	const isClassicEditor = getSelectedEditor( state, siteId ) === 'classic';
	const domains = getDomainsBySiteId( state, siteId );
	const isStaticHomePage =
		! isClassicEditor && 'page' === getSiteOption( state, siteId, 'show_on_front' );
	const siteSlug = getSelectedSiteSlug( state );
	const staticHomePageId = getSiteFrontPage( state, siteId );
	const editHomePageUrl =
		isStaticHomePage && `/block-editor/page/${ siteSlug }/${ staticHomePageId }`;

	return {
		customizeUrl: getCustomizerUrl( state, siteId ),
		menusUrl: getCustomizerUrl( state, siteId, 'menus' ),
		isNewlyCreatedSite: isNewSite( state, siteId ),
		showCustomizer: ! isSiteUsingFullSiteEditing( state, siteId ),
		hasCustomDomain: getGSuiteSupportedDomains( domains ).length > 0,
		siteSlug,
		isStaticHomePage,
		editHomePageUrl,
	};
};

const mapDispatchToProps = {
	editHomepageAction,
	writePostAction,
	addPageAction,
	manageCommentsAction,
	trackEditMenusAction,
	trackCustomizeThemeAction,
	changeThemeAction,
	trackDesignLogoAction,
	addEmailAction,
	addDomainAction,
};

const mergeProps = ( stateProps, dispatchProps, ownProps ) => {
	const { editHomePageUrl, isStaticHomePage, siteSlug } = stateProps;
	return {
		...stateProps,
		editHomepageAction: () => dispatchProps.editHomepageAction( editHomePageUrl, isStaticHomePage ),
		writePostAction: () => dispatchProps.writePostAction( siteSlug, isStaticHomePage ),
		addPageAction: () => dispatchProps.addPageAction( siteSlug, isStaticHomePage ),
		manageCommentsAction: () => dispatchProps.manageCommentsAction( siteSlug, isStaticHomePage ),
		trackEditMenusAction: () => dispatchProps.trackEditMenusAction( isStaticHomePage ),
		trackCustomizeThemeAction: () => dispatchProps.trackCustomizeThemeAction( isStaticHomePage ),
		changeThemeAction: () => dispatchProps.changeThemeAction( siteSlug, isStaticHomePage ),
		trackDesignLogoAction: () => dispatchProps.trackDesignLogoAction( isStaticHomePage ),
		addEmailAction: () => dispatchProps.addEmailAction( siteSlug, isStaticHomePage ),
		addDomainAction: () => dispatchProps.addDomainAction( siteSlug, isStaticHomePage ),
		...ownProps,
	};
};

export default connect( mapStateToProps, mapDispatchToProps, mergeProps )( QuickLinks );
