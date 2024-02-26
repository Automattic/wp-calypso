import config from '@automattic/calypso-config';
import { getAllFeaturesForPlan } from '@automattic/calypso-products/';
import { JetpackLogo, FoldableCard } from '@automattic/components';
import { GeneratorModal } from '@automattic/jetpack-ai-calypso';
import i18n, { getLocaleSlug, useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { connect, useSelector } from 'react-redux';
import { useDebouncedCallback } from 'use-debounce';
import fiverrIcon from 'calypso/assets/images/customer-home/fiverr-logo-grey.svg';
import blazeIcon from 'calypso/assets/images/icons/blaze-icon.svg';
import withIsFSEActive from 'calypso/data/themes/with-is-fse-active';
import { canCurrentUserAddEmail } from 'calypso/lib/domains';
import { hasPaidEmailWithUs } from 'calypso/lib/emails';
import {
	recordDSPEntryPoint,
	usePromoteWidget,
	PromoteWidgetStatus,
} from 'calypso/lib/promote-post';
import { bumpStat, composeAnalytics, recordTracksEvent } from 'calypso/state/analytics/actions';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference } from 'calypso/state/preferences/selectors';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { getSelectedEditor } from 'calypso/state/selectors/get-selected-editor';
import getSiteEditorUrl from 'calypso/state/selectors/get-site-editor-url';
import isSiteAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import isSiteWpcomStaging from 'calypso/state/selectors/is-site-wpcom-staging';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import {
	getSiteFrontPage,
	getCustomizerUrl,
	getSiteOption,
	isNewSite,
	getSitePlanSlug,
	getSite,
} from 'calypso/state/sites/selectors';
import getSiteAdminUrl from 'calypso/state/sites/selectors/get-site-admin-url';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import ActionBox from './action-box';

import './style.scss';

export const QuickLinks = ( {
	canEditPages,
	canCustomize,
	canSwitchThemes,
	canManageSite,
	canModerateComments,
	customizeUrl,
	isWpcomStagingSite,
	isStaticHomePage,
	canAddEmail,
	menusUrl,
	trackEditHomepageAction,
	trackWritePostAction,
	trackPromotePostAction,
	trackAddPageAction,
	trackManageCommentsAction,
	trackEditMenusAction,
	trackEditSiteAction,
	trackCustomizeThemeAction,
	trackChangeThemeAction,
	trackDesignLogoAction,
	trackAddEmailAction,
	trackAddDomainAction,
	trackManageAllDomainsAction,
	trackExplorePluginsAction,
	isExpanded,
	updateHomeQuickLinksToggleStatus,
	siteAdminUrl,
	editHomePageUrl,
	siteSlug,
	isFSEActive,
	siteEditorUrl,
	isAtomic,
	adminInterface,
} ) => {
	const translate = useTranslate();
	const [
		debouncedUpdateHomeQuickLinksToggleStatus,
		,
		flushDebouncedUpdateHomeQuickLinksToggleStatus,
	] = useDebouncedCallback( updateHomeQuickLinksToggleStatus, 1000 );
	const isPromotePostActive = usePromoteWidget() === PromoteWidgetStatus.ENABLED;
	const siteId = useSelector( getSelectedSiteId );
	const currentSitePlanSlug = useSelector( ( state ) => getSitePlanSlug( state, siteId ) );
	const site = useSelector( ( state ) => getSite( state, siteId ) );
	const hasBackups = getAllFeaturesForPlan( currentSitePlanSlug ).includes( 'backups' );
	const hasBoost = site?.options?.jetpack_connection_active_plugins?.includes( 'jetpack-boost' );
	const [ isAILogoGeneratorOpen, setIsAILogoGeneratorOpen ] = useState( false );

	const addNewDomain = () => {
		trackAddDomainAction();
	};

	const customizerLinks =
		isStaticHomePage && canEditPages ? (
			<ActionBox
				href={ editHomePageUrl }
				hideLinkIndicator
				onClick={ trackEditHomepageAction }
				label={ translate( 'Edit homepage' ) }
				materialIcon="laptop"
			/>
		) : null;

	const usesWpAdminInterface = adminInterface === 'wp-admin';

	const quickLinks = (
		<div className="quick-links__boxes">
			{ isFSEActive && canManageSite ? (
				<ActionBox
					href={ siteEditorUrl }
					hideLinkIndicator
					onClick={ trackEditSiteAction }
					label={ translate( 'Edit site' ) }
					materialIcon="laptop"
				/>
			) : (
				customizerLinks
			) }
			<ActionBox
				href={ usesWpAdminInterface ? `${ siteAdminUrl }post-new.php` : `/post/${ siteSlug }` }
				hideLinkIndicator
				onClick={ trackWritePostAction }
				label={ translate( 'Write blog post' ) }
				materialIcon="edit"
			/>
			{ isPromotePostActive && ! isWpcomStagingSite && (
				<ActionBox
					href={ `/advertising/${ siteSlug }` }
					hideLinkIndicator
					onClick={ trackPromotePostAction }
					label={ translate( 'Promote with Blaze' ) }
					iconSrc={ blazeIcon }
				/>
			) }
			{ ! isStaticHomePage && canModerateComments && (
				<ActionBox
					href={
						usesWpAdminInterface ? `${ siteAdminUrl }edit-comments.php` : `/comments/${ siteSlug }`
					}
					hideLinkIndicator
					onClick={ trackManageCommentsAction }
					label={ translate( 'Manage comments' ) }
					materialIcon="mode_comment"
				/>
			) }
			{ canEditPages && (
				<ActionBox
					href={
						usesWpAdminInterface
							? `${ siteAdminUrl }post-new.php?post_type=page`
							: `/page/${ siteSlug }`
					}
					hideLinkIndicator
					onClick={ trackAddPageAction }
					label={ translate( 'Add a page' ) }
					materialIcon="insert_drive_file"
				/>
			) }
			{ canCustomize && (
				<>
					<ActionBox
						href={ menusUrl }
						hideLinkIndicator
						onClick={ trackEditMenusAction }
						label={ translate( 'Edit menus' ) }
						materialIcon="list"
					/>
					<ActionBox
						href={ customizeUrl }
						hideLinkIndicator
						onClick={ trackCustomizeThemeAction }
						label={ translate( 'Customize theme' ) }
						materialIcon="palette"
					/>
				</>
			) }
			{ canSwitchThemes && (
				<ActionBox
					href={ `/themes/${ siteSlug }` }
					hideLinkIndicator
					onClick={ trackChangeThemeAction }
					label={ translate( 'Change theme' ) }
					materialIcon="view_quilt"
				/>
			) }
			{ canManageSite && ! isWpcomStagingSite && (
				<>
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
							onClick={ addNewDomain }
							label={ translate( 'Add a domain' ) }
							gridicon="add-outline"
						/>
					) }
				</>
			) }
			{ canManageSite && (
				<ActionBox
					href="/domains/manage"
					hideLinkIndicator
					onClick={ trackManageAllDomainsAction }
					label={ translate( 'Manage all domains' ) }
					gridicon="domains"
				/>
			) }
			{ siteAdminUrl && (
				<ActionBox
					href={ siteAdminUrl }
					hideLinkIndicator
					gridicon="my-sites"
					label={ translate( 'WP Admin Dashboard' ) }
				/>
			) }
			{ canManageSite && (
				<>
					<ActionBox
						href={
							usesWpAdminInterface ? `${ siteAdminUrl }plugins.php` : `/plugins/${ siteSlug }`
						}
						hideLinkIndicator
						onClick={ trackExplorePluginsAction }
						label={ translate( 'Explore Plugins' ) }
						gridicon="plugins"
					/>
					<ActionBox
						href="https://wp.me/logo-maker/?utm_campaign=my_home"
						onClick={ trackDesignLogoAction }
						target="_blank"
						label={
							getLocaleSlug() === 'en' ||
							getLocaleSlug() === 'en-gb' ||
							i18n.hasTranslation( 'Create a logo with Fiverr' )
								? translate( 'Create a logo with Fiverr' )
								: translate( 'Create a logo' )
						}
						external
						iconSrc={ fiverrIcon }
					/>
					{ config.isEnabled( 'jetpack/ai-logo-generator' ) && (
						<>
							<ActionBox
								hideLinkIndicator
								gridicon="plans"
								label={ translate( 'Create a logo with Jetpack AI' ) }
								onClick={ () => setIsAILogoGeneratorOpen( true ) }
							/>
							<GeneratorModal
								siteDetails={ site }
								isOpen={ isAILogoGeneratorOpen }
								onClose={ () => setIsAILogoGeneratorOpen( false ) }
								context="calypso"
							/>
						</>
					) }
				</>
			) }
			{ isAtomic && hasBoost && (
				<ActionBox
					href={ `https://${ siteSlug }/wp-admin/admin.php?page=jetpack-boost` }
					hideLinkIndicator
					label={ translate( 'Speed up your site' ) }
					iconComponent={ <JetpackLogo monochrome className="quick-links__action-box-icon" /> }
				/>
			) }
			{ isAtomic && hasBackups && (
				<ActionBox
					href={
						config.isEnabled( 'layout/dotcom-nav-redesign' ) && usesWpAdminInterface
							? `https://jetpack.com/redirect/?source=calypso-backups&site=${ siteSlug }`
							: `/backup/${ siteSlug }`
					}
					hideLinkIndicator
					label={ translate( 'Restore a backup' ) }
					iconComponent={ <JetpackLogo monochrome className="quick-links__action-box-icon" /> }
				/>
			) }
		</div>
	);

	useEffect( () => {
		return () => {
			flushDebouncedUpdateHomeQuickLinksToggleStatus();
		};
	}, [] );

	return (
		<FoldableCard
			className="quick-links customer-home__card"
			headerTagName="h2"
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

const trackPromotePostAction = () => ( dispatch ) => {
	dispatch( recordDSPEntryPoint( 'myhome_quick-links' ) );
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

const trackEditSiteAction = () =>
	composeAnalytics(
		recordTracksEvent( 'calypso_customer_home_my_site_site_editor_link' ),
		bumpStat( 'calypso_customer_home', 'my_site_site_editor' )
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

const trackExplorePluginsAction = ( isStaticHomePage ) => ( dispatch ) => {
	dispatch(
		composeAnalytics(
			recordTracksEvent( 'calypso_customer_home_my_site_explore_plugins_click', {
				is_static_home_page: isStaticHomePage,
			} ),
			bumpStat( 'calypso_customer_home', 'my_site_explore_plugins' )
		)
	);
};

export const trackAddDomainAction = ( isStaticHomePage ) => ( dispatch ) => {
	dispatch(
		composeAnalytics(
			recordTracksEvent( 'calypso_customer_home_my_site_add_domain_click', {
				is_static_home_page: isStaticHomePage,
			} ),
			bumpStat( 'calypso_customer_home', 'my_site_add_domain' )
		)
	);
};

export const trackManageAllDomainsAction = ( isStaticHomePage ) => ( dispatch ) => {
	dispatch(
		composeAnalytics(
			recordTracksEvent( 'calypso_customer_home_my_site_manage_all_domains_click', {
				is_static_home_page: isStaticHomePage,
			} ),
			bumpStat( 'calypso_customer_home', 'my_site_manage_all_domains' )
		)
	);
};

/**
 * Select a list of domains that are eligible to add email to from a larger list.
 * WPCOM-specific domains like free and staging sub-domains are filtered from this list courtesy of `canCurrentUserAddEmail`
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
		siteId,
		canEditPages: canCurrentUser( state, siteId, 'edit_pages' ),
		canCustomize: canCurrentUser( state, siteId, 'customize' ),
		canSwitchThemes: canCurrentUser( state, siteId, 'switch_themes' ),
		canManageSite: canCurrentUser( state, siteId, 'manage_options' ),
		canModerateComments: canCurrentUser( state, siteId, 'moderate_comments' ),
		customizeUrl: getCustomizerUrl( state, siteId ),
		menusUrl: getCustomizerUrl( state, siteId, 'menus' ),
		isNewlyCreatedSite: isNewSite( state, siteId ),
		canAddEmail,
		siteSlug,
		isStaticHomePage,
		editHomePageUrl,
		isAtomic: isSiteAtomic( state, siteId ),
		isWpcomStagingSite: isSiteWpcomStaging( state, siteId ),
		isExpanded: getPreference( state, 'homeQuickLinksToggleStatus' ) !== 'collapsed',
		siteAdminUrl: getSiteAdminUrl( state, siteId ),
		siteEditorUrl: getSiteEditorUrl( state, siteId ),
		adminInterface: getSiteOption( state, siteId, 'wpcom_admin_interface' ),
	};
};

const mapDispatchToProps = {
	trackEditHomepageAction,
	trackWritePostAction,
	trackPromotePostAction,
	trackAddPageAction,
	trackManageCommentsAction,
	trackEditMenusAction,
	trackEditSiteAction,
	trackCustomizeThemeAction,
	trackChangeThemeAction,
	trackDesignLogoAction,
	trackAnchorPodcastAction,
	trackAddEmailAction,
	trackAddDomainAction,
	trackManageAllDomainsAction,
	trackExplorePluginsAction,
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
		trackPromotePostAction: () => dispatchProps.trackPromotePostAction( isStaticHomePage ),
		trackAddPageAction: () => dispatchProps.trackAddPageAction( isStaticHomePage ),
		trackManageCommentsAction: () => dispatchProps.trackManageCommentsAction( isStaticHomePage ),
		trackEditMenusAction: () => dispatchProps.trackEditMenusAction( isStaticHomePage ),
		trackCustomizeThemeAction: () => dispatchProps.trackCustomizeThemeAction( isStaticHomePage ),
		trackChangeThemeAction: () => dispatchProps.trackChangeThemeAction( isStaticHomePage ),
		trackDesignLogoAction: () => dispatchProps.trackDesignLogoAction( isStaticHomePage ),
		trackAnchorPodcastAction: () => dispatchProps.trackAnchorPodcastAction( isStaticHomePage ),
		trackAddEmailAction: () => dispatchProps.trackAddEmailAction( isStaticHomePage ),
		trackAddDomainAction: () => dispatchProps.trackAddDomainAction( isStaticHomePage ),
		trackManageAllDomainsAction: () =>
			dispatchProps.trackManageAllDomainsAction( isStaticHomePage ),
		trackExplorePluginsAction: () => dispatchProps.trackExplorePluginsAction( isStaticHomePage ),
		...ownProps,
	};
};

const ConnectedQuickLinks = connect(
	mapStateToProps,
	mapDispatchToProps,
	mergeProps
)( withIsFSEActive( QuickLinks ) );

export default ConnectedQuickLinks;
