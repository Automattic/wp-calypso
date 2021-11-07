import i18nCalypso, { getLocaleSlug, useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { connect } from 'react-redux';
import { useDebouncedCallback } from 'use-debounce';
import anchorLogoIcon from 'calypso/assets/images/customer-home/anchor-logo-grey.svg';
import fiverrIcon from 'calypso/assets/images/customer-home/fiverr-logo-grey.svg';
import FoldableCard from 'calypso/components/foldable-card';
import { canCurrentUserAddEmail } from 'calypso/lib/domains';
import { hasPaidEmailWithUs } from 'calypso/lib/emails';
import { bumpStat, composeAnalytics, recordTracksEvent } from 'calypso/state/analytics/actions';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference } from 'calypso/state/preferences/selectors';
import { getSelectedEditor } from 'calypso/state/selectors/get-selected-editor';
import isNavUnificationEnabled from 'calypso/state/selectors/is-nav-unification-enabled';
import isSiteUsingFullSiteEditing from 'calypso/state/selectors/is-site-using-full-site-editing';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import {
	getSiteFrontPage,
	getCustomizerUrl,
	getSiteOption,
	isNewSite,
} from 'calypso/state/sites/selectors';
import getSiteAdminUrl from 'calypso/state/sites/selectors/get-site-admin-url';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import ActionBox from './action-box';

import './style.scss';

export const QuickLinks = ( {
	customizeUrl,
	isStaticHomePage,
	showCustomizer,
	canAddEmail,
	menusUrl,
	trackEditHomepageAction,
	trackWritePostAction,
	trackAddPageAction,
	trackManageCommentsAction,
	trackEditMenusAction,
	trackCustomizeThemeAction,
	trackChangeThemeAction,
	trackDesignLogoAction,
	trackAnchorPodcastAction,
	trackAddEmailAction,
	trackAddDomainAction,
	isExpanded,
	updateHomeQuickLinksToggleStatus,
	isUnifiedNavEnabled,
	siteAdminUrl,
	editHomePageUrl,
	siteSlug,
} ) => {
	const translate = useTranslate();
	const [
		debouncedUpdateHomeQuickLinksToggleStatus,
		,
		flushDebouncedUpdateHomeQuickLinksToggleStatus,
	] = useDebouncedCallback( updateHomeQuickLinksToggleStatus, 1000 );

	const quickLinks = (
		<div className="quick-links__boxes">
			{ isStaticHomePage ? (
				<ActionBox
					href={ editHomePageUrl }
					hideLinkIndicator
					onClick={ trackEditHomepageAction }
					label={ translate( 'Edit homepage' ) }
					materialIcon="laptop"
				/>
			) : (
				<ActionBox
					href={ `/post/${ siteSlug }` }
					hideLinkIndicator
					onClick={ trackWritePostAction }
					label={ translate( 'Write blog post' ) }
					materialIcon="edit"
				/>
			) }
			{ isStaticHomePage ? (
				<ActionBox
					href={ `/page/${ siteSlug }` }
					hideLinkIndicator
					onClick={ trackAddPageAction }
					label={ translate( 'Add a page' ) }
					materialIcon="insert_drive_file"
				/>
			) : (
				<ActionBox
					href={ `/comments/${ siteSlug }` }
					hideLinkIndicator
					onClick={ trackManageCommentsAction }
					label={ translate( 'Manage comments' ) }
					materialIcon="mode_comment"
				/>
			) }
			{ isStaticHomePage ? (
				<ActionBox
					href={ `/post/${ siteSlug }` }
					hideLinkIndicator
					onClick={ trackWritePostAction }
					label={ translate( 'Write blog post' ) }
					materialIcon="edit"
				/>
			) : (
				<ActionBox
					href={ `/page/${ siteSlug }` }
					hideLinkIndicator
					onClick={ trackAddPageAction }
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
				href={ `/themes/${ siteSlug }` }
				hideLinkIndicator
				onClick={ trackChangeThemeAction }
				label={ translate( 'Change theme' ) }
				materialIcon="view_quilt"
			/>
			{ canAddEmail ? (
				<ActionBox
					href={ `/email/${ siteSlug }` }
					hideLinkIndicator
					onClick={ trackAddEmailAction }
					label={ translate( 'Add email' ) }
					materialIcon="email"
				/>
			) : (
				<ActionBox
					href={ `/domains/add/${ siteSlug }` }
					hideLinkIndicator
					onClick={ trackAddDomainAction }
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
				href="https://wp.me/logo-maker/?utm_campaign=my_home"
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

	useEffect( () => {
		return () => {
			flushDebouncedUpdateHomeQuickLinksToggleStatus();
		};
	}, [] );

	return (
		<FoldableCard
			className="quick-links"
			header={ translate( 'Quick links' ) }
			clickableHeader
			expanded={ isExpanded }
			onOpen={ () => debouncedUpdateHomeQuickLinksToggleStatus( 'expanded' ) }
			onClose={ () => debouncedUpdateHomeQuickLinksToggleStatus( 'collapsed' ) }
		>
			{ quickLinks }
		</FoldableCard>
	);
};

const trackEditHomepageAction = ( isStaticHomePage ) => ( dispatch ) => {
	dispatch(
		composeAnalytics(
			recordTracksEvent( 'calypso_customer_home_my_site_edit_homepage_click', {
				is_static_home_page: isStaticHomePage,
			} ),
			bumpStat( 'calypso_customer_home', 'my_site_edit_homepage' )
		)
	);
};

const trackWritePostAction = ( isStaticHomePage ) => ( dispatch ) => {
	dispatch(
		composeAnalytics(
			recordTracksEvent( 'calypso_customer_home_my_site_write_post_click', {
				is_static_home_page: isStaticHomePage,
			} ),
			bumpStat( 'calypso_customer_home', 'my_site_write_post' )
		)
	);
};

const trackAddPageAction = ( isStaticHomePage ) => ( dispatch ) => {
	dispatch(
		composeAnalytics(
			recordTracksEvent( 'calypso_customer_home_my_site_add_page_click', {
				is_static_home_page: isStaticHomePage,
			} ),
			bumpStat( 'calypso_customer_home', 'my_site_add_page' )
		)
	);
};

const trackManageCommentsAction = ( isStaticHomePage ) => ( dispatch ) => {
	dispatch(
		composeAnalytics(
			recordTracksEvent( 'calypso_customer_home_my_site_manage_comments_click', {
				is_static_home_page: isStaticHomePage,
			} ),
			bumpStat( 'calypso_customer_home', 'my_site_manage_comments' )
		)
	);
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

const trackChangeThemeAction = ( isStaticHomePage ) => ( dispatch ) => {
	dispatch(
		composeAnalytics(
			recordTracksEvent( 'calypso_customer_home_my_site_change_theme_click', {
				is_static_home_page: isStaticHomePage,
			} ),
			bumpStat( 'calypso_customer_home', 'my_site_change_theme' )
		)
	);
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

const trackAddEmailAction = ( isStaticHomePage ) => ( dispatch ) => {
	dispatch(
		composeAnalytics(
			recordTracksEvent( 'calypso_customer_home_my_site_add_email_click', {
				is_static_home_page: isStaticHomePage,
			} ),
			bumpStat( 'calypso_customer_home', 'my_site_add_email' )
		)
	);
};

const trackAddDomainAction = ( isStaticHomePage ) => ( dispatch ) => {
	dispatch(
		composeAnalytics(
			recordTracksEvent( 'calypso_customer_home_my_site_add_domain_click', {
				is_static_home_page: isStaticHomePage,
			} ),
			bumpStat( 'calypso_customer_home', 'my_site_add_domain' )
		)
	);
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
	trackEditHomepageAction,
	trackWritePostAction,
	trackAddPageAction,
	trackManageCommentsAction,
	trackEditMenusAction,
	trackCustomizeThemeAction,
	trackChangeThemeAction,
	trackDesignLogoAction,
	trackAnchorPodcastAction,
	trackAddEmailAction,
	trackAddDomainAction,
	updateHomeQuickLinksToggleStatus: ( status ) =>
		savePreference( 'homeQuickLinksToggleStatus', status ),
};

const mergeProps = ( stateProps, dispatchProps, ownProps ) => {
	const { isStaticHomePage } = stateProps;
	return {
		...stateProps,
		...dispatchProps,
		trackEditHomepageAction: () => dispatchProps.trackEditHomepageAction( isStaticHomePage ),
		trackWritePostAction: () => dispatchProps.trackWritePostAction( isStaticHomePage ),
		trackAddPageAction: () => dispatchProps.trackAddPageAction( isStaticHomePage ),
		trackManageCommentsAction: () => dispatchProps.trackManageCommentsAction( isStaticHomePage ),
		trackEditMenusAction: () => dispatchProps.trackEditMenusAction( isStaticHomePage ),
		trackCustomizeThemeAction: () => dispatchProps.trackCustomizeThemeAction( isStaticHomePage ),
		trackChangeThemeAction: () => dispatchProps.trackChangeThemeAction( isStaticHomePage ),
		trackDesignLogoAction: () => dispatchProps.trackDesignLogoAction( isStaticHomePage ),
		trackAnchorPodcastAction: () => dispatchProps.trackAnchorPodcastAction( isStaticHomePage ),
		trackAddEmailAction: () => dispatchProps.trackAddEmailAction( isStaticHomePage ),
		trackAddDomainAction: () => dispatchProps.trackAddDomainAction( isStaticHomePage ),
		...ownProps,
	};
};

export default connect( mapStateToProps, mapDispatchToProps, mergeProps )( QuickLinks );
