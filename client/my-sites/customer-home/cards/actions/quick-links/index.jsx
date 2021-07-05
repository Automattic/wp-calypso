/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import i18nCalypso, { getLocaleSlug, useTranslate } from 'i18n-calypso';
import page from 'page';

/**
 * Internal dependencies
 */
import ActionBox from './action-box';
import { bumpStat, composeAnalytics, recordTracksEvent } from 'calypso/state/analytics/actions';
import { canCurrentUserAddEmail } from 'calypso/lib/domains';
import FoldableCard from 'calypso/components/foldable-card';
import { getPreference } from 'calypso/state/preferences/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import {
	getSiteFrontPage,
	getCustomizerUrl,
	getSiteOption,
	isNewSite,
} from 'calypso/state/sites/selectors';
import { getSelectedEditor } from 'calypso/state/selectors/get-selected-editor';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import { hasPaidEmailWithUs } from 'calypso/lib/emails';
import isSiteUsingFullSiteEditing from 'calypso/state/selectors/is-site-using-full-site-editing';
import { savePreference } from 'calypso/state/preferences/actions';
import isNavUnificationEnabled from 'calypso/state/selectors/is-nav-unification-enabled';
import getSiteAdminUrl from 'calypso/state/sites/selectors/get-site-admin-url';

/**
 * Image dependencies
 */
import fiverrIcon from 'calypso/assets/images/customer-home/fiverr-logo-grey.svg';
import anchorLogoIcon from 'calypso/assets/images/customer-home/anchor-logo-grey.svg';

/**
 * Style dependencies
 */
import './style.scss';

export const QuickLinks = ( {
	customizeUrl,
	isStaticHomePage,
	showCustomizer,
	canAddEmail,
	menusUrl,
	editHomepageAction,
	writePostAction,
	addPageAction,
	manageCommentsAction,
	trackEditMenusAction,
	trackCustomizeThemeAction,
	changeThemeAction,
	trackDesignLogoAction,
	trackAnchorPodcastAction,
	addEmailAction,
	addDomainAction,
	isExpanded,
	expand,
	collapse,
	isUnifiedNavEnabled,
	siteAdminUrl,
} ) => {
	const translate = useTranslate();

	const quickLinks = (
		<div className="quick-links__boxes">
			{ isStaticHomePage ? (
				<ActionBox
					onClick={ editHomepageAction }
					label={ translate( 'Edit homepage' ) }
					materialIcon="laptop"
				/>
			) : (
				<ActionBox
					onClick={ writePostAction }
					label={ translate( 'Write blog post' ) }
					materialIcon="edit"
				/>
			) }
			{ isStaticHomePage ? (
				<ActionBox
					onClick={ addPageAction }
					label={ translate( 'Add a page' ) }
					materialIcon="insert_drive_file"
				/>
			) : (
				<ActionBox
					onClick={ manageCommentsAction }
					label={ translate( 'Manage comments' ) }
					materialIcon="mode_comment"
				/>
			) }
			{ isStaticHomePage ? (
				<ActionBox
					onClick={ writePostAction }
					label={ translate( 'Write blog post' ) }
					materialIcon="edit"
				/>
			) : (
				<ActionBox
					onClick={ addPageAction }
					label={ translate( 'Add a page' ) }
					materialIcon="insert_drive_file"
				/>
			) }
			{ showCustomizer && (
				<ActionBox
					href={ menusUrl }
					hideLinkIndicator
					onClick={ trackEditMenusAction }
					label={ translate( 'Edit menus' ) }
					materialIcon="list"
				/>
			) }
			{ showCustomizer && (
				<ActionBox
					href={ customizeUrl }
					hideLinkIndicator
					onClick={ trackCustomizeThemeAction }
					label={ translate( 'Customize theme' ) }
					materialIcon="palette"
				/>
			) }
			<ActionBox
				onClick={ changeThemeAction }
				label={ translate( 'Change theme' ) }
				materialIcon="view_quilt"
			/>
			{ canAddEmail ? (
				<ActionBox
					onClick={ addEmailAction }
					label={ translate( 'Add email' ) }
					materialIcon="email"
				/>
			) : (
				<ActionBox
					onClick={ addDomainAction }
					label={ translate( 'Add a domain' ) }
					gridicon="domains"
				/>
			) }
			{ isUnifiedNavEnabled && siteAdminUrl && (
				<ActionBox
					href={ siteAdminUrl }
					hideLinkIndicator
					gridicon="my-sites"
					label={ translate( 'WP Admin Dashboard' ) }
				/>
			) }
			<ActionBox
				href="https://wp.me/logo-maker"
				onClick={ trackDesignLogoAction }
				target="_blank"
				label={
					getLocaleSlug() === 'en' ||
					getLocaleSlug() === 'en-gb' ||
					i18nCalypso.hasTranslation( 'Create a logo with Fiverr' )
						? translate( 'Create a logo with Fiverr' )
						: translate( 'Create a logo' )
				}
				external
				iconSrc={ fiverrIcon }
			/>
			<ActionBox
				href="https://anchor.fm/wordpressdotcom"
				onClick={ trackAnchorPodcastAction }
				target="_blank"
				label={ translate( 'Create a podcast with Anchor' ) }
				external
				iconSrc={ anchorLogoIcon }
			/>
		</div>
	);

	return (
		<FoldableCard
			className="quick-links"
			header={ translate( 'Quick links' ) }
			clickableHeader
			expanded={ isExpanded }
			onOpen={ expand }
			onClose={ collapse }
		>
			{ quickLinks }
		</FoldableCard>
	);
};

const editHomepageAction = ( editHomePageUrl, isStaticHomePage ) => ( dispatch ) => {
	dispatch(
		composeAnalytics(
			recordTracksEvent( 'calypso_customer_home_my_site_edit_homepage_click', {
				is_static_home_page: isStaticHomePage,
			} ),
			bumpStat( 'calypso_customer_home', 'my_site_edit_homepage' )
		)
	);
	page( editHomePageUrl );
};

const writePostAction = ( siteSlug, isStaticHomePage ) => ( dispatch ) => {
	dispatch(
		composeAnalytics(
			recordTracksEvent( 'calypso_customer_home_my_site_write_post_click', {
				is_static_home_page: isStaticHomePage,
			} ),
			bumpStat( 'calypso_customer_home', 'my_site_write_post' )
		)
	);
	page( `/post/${ siteSlug }` );
};

const addPageAction = ( siteSlug, isStaticHomePage ) => ( dispatch ) => {
	dispatch(
		composeAnalytics(
			recordTracksEvent( 'calypso_customer_home_my_site_add_page_click', {
				is_static_home_page: isStaticHomePage,
			} ),
			bumpStat( 'calypso_customer_home', 'my_site_add_page' )
		)
	);
	page( `/page/${ siteSlug }` );
};

const manageCommentsAction = ( siteSlug, isStaticHomePage ) => ( dispatch ) => {
	dispatch(
		composeAnalytics(
			recordTracksEvent( 'calypso_customer_home_my_site_manage_comments_click', {
				is_static_home_page: isStaticHomePage,
			} ),
			bumpStat( 'calypso_customer_home', 'my_site_manage_comments' )
		)
	);
	page( `/comments/${ siteSlug }` );
};

const trackEditMenusAction = ( isStaticHomePage ) =>
	composeAnalytics(
		recordTracksEvent( 'calypso_customer_home_my_site_edit_menus_click', {
			is_static_home_page: isStaticHomePage,
		} ),
		bumpStat( 'calypso_customer_home', 'my_site_edit_menus' )
	);

const trackCustomizeThemeAction = ( isStaticHomePage ) =>
	composeAnalytics(
		recordTracksEvent( 'calypso_customer_home_my_site_customize_theme_click', {
			is_static_home_page: isStaticHomePage,
		} ),
		bumpStat( 'calypso_customer_home', 'my_site_customize_theme' )
	);

const changeThemeAction = ( siteSlug, isStaticHomePage ) => ( dispatch ) => {
	dispatch(
		composeAnalytics(
			recordTracksEvent( 'calypso_customer_home_my_site_change_theme_click', {
				is_static_home_page: isStaticHomePage,
			} ),
			bumpStat( 'calypso_customer_home', 'my_site_change_theme' )
		)
	);
	page( `/themes/${ siteSlug }` );
};

const trackDesignLogoAction = ( isStaticHomePage ) =>
	composeAnalytics(
		recordTracksEvent( 'calypso_customer_home_my_site_design_logo_click', {
			is_static_home_page: isStaticHomePage,
		} ),
		bumpStat( 'calypso_customer_home', 'my_site_design_logo' )
	);

const trackAnchorPodcastAction = ( isStaticHomePage ) =>
	composeAnalytics(
		recordTracksEvent( 'calypso_customer_home_my_site_anchor_podcast_click', {
			is_static_home_page: isStaticHomePage,
		} ),
		bumpStat( 'calypso_customer_home', 'my_site_anchor_podcast' )
	);

const addEmailAction = ( siteSlug, isStaticHomePage ) => ( dispatch ) => {
	dispatch(
		composeAnalytics(
			recordTracksEvent( 'calypso_customer_home_my_site_add_email_click', {
				is_static_home_page: isStaticHomePage,
			} ),
			bumpStat( 'calypso_customer_home', 'my_site_add_email' )
		)
	);
	page( `/email/${ siteSlug }` );
};

const addDomainAction = ( siteSlug, isStaticHomePage ) => ( dispatch ) => {
	dispatch(
		composeAnalytics(
			recordTracksEvent( 'calypso_customer_home_my_site_add_domain_click', {
				is_static_home_page: isStaticHomePage,
			} ),
			bumpStat( 'calypso_customer_home', 'my_site_add_domain' )
		)
	);
	page( `/domains/add/${ siteSlug }` );
};

/**
 * Select a list of domains that are eligible to add email to from a larger list.
 * WPCOM-specific domains like free and staging sub-domains are filtered from this list courtesy of `canCurrentUserAddEmail`
 *
 * @param domains An array domains to filter
 */
const getDomainsThatCanAddEmail = ( domains ) =>
	domains.filter(
		( domain ) => ! hasPaidEmailWithUs( domain ) && canCurrentUserAddEmail( domain )
	);

const mapStateToProps = ( state ) => {
	const siteId = getSelectedSiteId( state );
	const isClassicEditor = getSelectedEditor( state, siteId ) === 'classic';
	const domains = getDomainsBySiteId( state, siteId );
	const isStaticHomePage =
		! isClassicEditor && 'page' === getSiteOption( state, siteId, 'show_on_front' );
	const siteSlug = getSelectedSiteSlug( state );
	const staticHomePageId = getSiteFrontPage( state, siteId );
	const editHomePageUrl = isStaticHomePage && `/page/${ siteSlug }/${ staticHomePageId }`;

	const canAddEmail = getDomainsThatCanAddEmail( domains ).length > 0;

	return {
		customizeUrl: getCustomizerUrl( state, siteId ),
		menusUrl: getCustomizerUrl( state, siteId, 'menus' ),
		isNewlyCreatedSite: isNewSite( state, siteId ),
		showCustomizer: ! isSiteUsingFullSiteEditing( state, siteId ),
		canAddEmail,
		siteSlug,
		isStaticHomePage,
		editHomePageUrl,
		isExpanded: getPreference( state, 'homeQuickLinksToggleStatus' ) !== 'collapsed',
		isUnifiedNavEnabled: isNavUnificationEnabled,
		siteAdminUrl: getSiteAdminUrl( state, siteId ),
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
	trackAnchorPodcastAction,
	addEmailAction,
	addDomainAction,
	expand: () => savePreference( 'homeQuickLinksToggleStatus', 'expanded' ),
	collapse: () => savePreference( 'homeQuickLinksToggleStatus', 'collapsed' ),
};

const mergeProps = ( stateProps, dispatchProps, ownProps ) => {
	const { editHomePageUrl, isStaticHomePage, siteSlug } = stateProps;
	return {
		...stateProps,
		...dispatchProps,
		editHomepageAction: () => dispatchProps.editHomepageAction( editHomePageUrl, isStaticHomePage ),
		writePostAction: () => dispatchProps.writePostAction( siteSlug, isStaticHomePage ),
		addPageAction: () => dispatchProps.addPageAction( siteSlug, isStaticHomePage ),
		manageCommentsAction: () => dispatchProps.manageCommentsAction( siteSlug, isStaticHomePage ),
		trackEditMenusAction: () => dispatchProps.trackEditMenusAction( isStaticHomePage ),
		trackCustomizeThemeAction: () => dispatchProps.trackCustomizeThemeAction( isStaticHomePage ),
		changeThemeAction: () => dispatchProps.changeThemeAction( siteSlug, isStaticHomePage ),
		trackDesignLogoAction: () => dispatchProps.trackDesignLogoAction( isStaticHomePage ),
		trackAnchorPodcastAction: () => dispatchProps.trackAnchorPodcastAction( isStaticHomePage ),
		addEmailAction: () => dispatchProps.addEmailAction( siteSlug, isStaticHomePage ),
		addDomainAction: () => dispatchProps.addDomainAction( siteSlug, isStaticHomePage ),
		...ownProps,
	};
};

export default connect( mapStateToProps, mapDispatchToProps, mergeProps )( QuickLinks );
