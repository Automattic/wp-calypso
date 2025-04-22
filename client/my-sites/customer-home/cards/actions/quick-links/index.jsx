import config from '@automattic/calypso-config';
import { getAllFeaturesForPlan } from '@automattic/calypso-products/';
import { JetpackLogo, FoldableCard } from '@automattic/components';
import { blaze } from '@automattic/components/src/icons';
import { GeneratorModal } from '@automattic/jetpack-ai-calypso';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { connect, useSelector } from 'react-redux';
import { useDebouncedCallback } from 'use-debounce';
import fiverrIcon from 'calypso/assets/images/customer-home/fiverr-logo-grey.svg';
import withIsFSEActive from 'calypso/data/themes/with-is-fse-active';
import { usePromoteWidget, PromoteWidgetStatus } from 'calypso/lib/promote-post';
import useAdvertisingUrl from 'calypso/my-sites/advertising/useAdvertisingUrl';
import { bumpStat, composeAnalytics, recordTracksEvent } from 'calypso/state/analytics/actions';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference } from 'calypso/state/preferences/selectors';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { getSelectedEditor } from 'calypso/state/selectors/get-selected-editor';
import getSiteEditorUrl from 'calypso/state/selectors/get-site-editor-url';
import isSiteAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import isSiteWpcomStaging from 'calypso/state/selectors/is-site-wpcom-staging';
import {
	getSiteFrontPage,
	getCustomizerUrl,
	getSiteOption,
	isNewSite,
	getSitePlanSlug,
	getSite,
	isAdminInterfaceWPAdmin,
} from 'calypso/state/sites/selectors';
import getSiteAdminUrl from 'calypso/state/sites/selectors/get-site-admin-url';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import ActionBox from './action-box';

import './style.scss';

export const QuickLinks = ( {
	canEditPages,
	canCustomize,
	canManageSite,
	canModerateComments,
	customizeUrl,
	isWpcomStagingSite,
	isStaticHomePage,
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
	trackAddDomainAction,
	trackManageAllDomainsAction,
	trackManageEmailsAction,
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
	const advertisingUrl = useAdvertisingUrl();

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
	const adminInterfaceIsWPAdmin = useSelector( ( state ) =>
		isAdminInterfaceWPAdmin( state, siteId )
	);

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
				href={ `${ siteAdminUrl }post-new.php` }
				hideLinkIndicator
				onClick={ trackWritePostAction }
				label={ translate( 'Write blog post' ) }
				materialIcon="edit"
			/>
			{ isPromotePostActive && ! isWpcomStagingSite && (
				<ActionBox
					href={ advertisingUrl }
					hideLinkIndicator
					onClick={ trackPromotePostAction }
					label={ translate( 'Promote with Blaze' ) }
					svgIcon={ blaze }
				/>
			) }
			{ ! isStaticHomePage && canModerateComments && (
				<ActionBox
					href={ `${ siteAdminUrl }edit-comments.php` }
					hideLinkIndicator
					onClick={ trackManageCommentsAction }
					label={ translate( 'Manage comments' ) }
					materialIcon="mode_comment"
				/>
			) }
			{ canEditPages && (
				<ActionBox
					href={ `${ siteAdminUrl }post-new.php?post_type=page` }
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
			{ canManageSite && ! isWpcomStagingSite && (
				<ActionBox
					href={ `/domains/add/${ siteSlug }` }
					hideLinkIndicator
					onClick={ addNewDomain }
					label={ translate( 'Add a domain' ) }
					gridicon="add-outline"
				/>
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
			{ canManageSite && ! isWpcomStagingSite && (
				<ActionBox
					href={ `/email/${ siteSlug }` }
					hideLinkIndicator
					onClick={ trackManageEmailsAction }
					label={ translate( 'Manage emails' ) }
					materialIcon="email"
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
						href={ usesWpAdminInterface ? `${ siteAdminUrl }themes.php` : `/themes/${ siteSlug }` }
						hideLinkIndicator
						onClick={ trackChangeThemeAction }
						label={ translate( 'Change theme' ) }
						iconComponent={
							<span
								className="quick-links__action-box-icon dashicons dashicons-admin-appearance"
								aria-hidden
							/>
						}
					/>
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
						label={ translate( 'Create a logo with Fiverr' ) }
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
						adminInterfaceIsWPAdmin
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
	dispatch( recordTracksEvent( 'calypso_customer_home_my_site_quick_link_blaze' ) );
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

export const trackManageEmailsAction = ( isStaticHomePage ) => ( dispatch ) => {
	dispatch(
		composeAnalytics(
			recordTracksEvent( 'calypso_customer_home_my_site_manage_emails_click', {
				is_static_home_page: isStaticHomePage,
			} ),
			bumpStat( 'calypso_customer_home', 'my_site_manage_emails' )
		)
	);
};

const mapStateToProps = ( state ) => {
	const siteId = getSelectedSiteId( state );
	const isClassicEditor = getSelectedEditor( state, siteId ) === 'classic';
	const isStaticHomePage =
		! isClassicEditor && 'page' === getSiteOption( state, siteId, 'show_on_front' );
	const siteSlug = getSelectedSiteSlug( state );
	const staticHomePageId = getSiteFrontPage( state, siteId );
	const editHomePageUrl = isStaticHomePage && `/page/${ siteSlug }/${ staticHomePageId }`;

	return {
		siteId,
		canEditPages: canCurrentUser( state, siteId, 'edit_pages' ),
		canCustomize: canCurrentUser( state, siteId, 'customize' ),
		canManageSite: canCurrentUser( state, siteId, 'manage_options' ),
		canModerateComments: canCurrentUser( state, siteId, 'moderate_comments' ),
		customizeUrl: getCustomizerUrl( state, siteId ),
		menusUrl: getCustomizerUrl( state, siteId, 'menus' ),
		isNewlyCreatedSite: isNewSite( state, siteId ),
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
	trackAddDomainAction,
	trackManageAllDomainsAction,
	trackManageEmailsAction,
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
		trackAddDomainAction: () => dispatchProps.trackAddDomainAction( isStaticHomePage ),
		trackManageAllDomainsAction: () =>
			dispatchProps.trackManageAllDomainsAction( isStaticHomePage ),
		trackManageEmailsAction: () => dispatchProps.trackManageEmailsAction( isStaticHomePage ),
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
