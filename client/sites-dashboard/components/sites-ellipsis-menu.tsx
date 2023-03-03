import { isEnabled } from '@automattic/calypso-config';
import {
	FEATURE_SFTP,
	WPCOM_FEATURES_MANAGE_PLUGINS,
	WPCOM_FEATURES_SITE_PREVIEW_LINKS,
} from '@automattic/calypso-products';
import {
	Button,
	Gridicon,
	SubmenuPopover,
	UpsellMenuGroup,
	useSubmenuPopoverProps,
} from '@automattic/components';
import { css } from '@emotion/css';
import styled from '@emotion/styled';
import { DropdownMenu, MenuGroup, MenuItem as CoreMenuItem, Modal } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { addQueryArgs } from '@wordpress/url';
import { ComponentType, useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import SitePreviewLink from 'calypso/components/site-preview-link';
import { useSiteCopy } from 'calypso/landing/stepper/hooks/use-site-copy';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { fetchSiteFeatures } from 'calypso/state/sites/features/actions';
import { launchSiteOrRedirectToLaunchSignupFlow } from 'calypso/state/sites/launch/actions';
import {
	getHostingConfigUrl,
	getManagePluginsUrl,
	getPluginsUrl,
	getSettingsUrl,
	isCustomDomain,
	isNotAtomicJetpack,
	isP2Site,
} from '../utils';
import type { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';

interface SitesMenuItemProps {
	site: SiteExcerptData;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	recordTracks: ( eventName: string, extraProps?: Record< string, any > ) => void;
	onClick?: () => void;
}

interface MenuItemLinkProps extends Omit< CoreMenuItem.Props, 'href' > {
	href?: string;
}

// Work around changes to core button styles done in _wp-components-overrides.scss
// which don't take menu item buttons into account.
const MenuItem = styled( CoreMenuItem )`
	&:visited {
		color: var( --color-neutral-70 );
	}
	&:hover:not( :disabled ) {
		color: var( --color-accent-60 );
	}
`;

const MenuItemLink = MenuItem as ComponentType< MenuItemLinkProps >;

const LaunchItem = ( { site, recordTracks }: SitesMenuItemProps ) => {
	const { __ } = useI18n();
	const dispatch = useReduxDispatch();

	return (
		<MenuItem
			onClick={ () => {
				dispatch( launchSiteOrRedirectToLaunchSignupFlow( site.ID, 'sites-dashboard' ) );
				recordTracks( 'calypso_sites_dashboard_site_action_launch_click' );
			} }
		>
			{ __( 'Launch site' ) }
		</MenuItem>
	);
};

const SettingsItem = ( { site, recordTracks }: SitesMenuItemProps ) => {
	const { __ } = useI18n();

	return (
		<MenuItemLink
			href={ getSettingsUrl( site.slug ) }
			onClick={ () => recordTracks( 'calypso_sites_dashboard_site_action_settings_click' ) }
		>
			{ __( 'Settings' ) }
		</MenuItemLink>
	);
};

const ManagePluginsItem = ( { site, recordTracks }: SitesMenuItemProps ) => {
	const { __ } = useI18n();
	const hasManagePluginsFeature =
		useSelector( ( state ) => siteHasFeature( state, site.ID, WPCOM_FEATURES_MANAGE_PLUGINS ) ) ||
		isNotAtomicJetpack( site );
	// If the site can't manage plugins then go to the main plugins page instead
	// because it shows an upsell message.
	const [ href, label ] = hasManagePluginsFeature
		? [ getManagePluginsUrl( site.slug ), __( 'Manage plugins' ) ]
		: [ getPluginsUrl( site.slug ), __( 'Plugins' ) ];

	return (
		<MenuItemLink
			href={ href }
			onClick={ () =>
				recordTracks( 'calypso_sites_dashboard_site_action_plugins_click', {
					has_manage_plugins_feature: hasManagePluginsFeature,
				} )
			}
			info={
				isEnabled( 'dev/developer-ux' ) &&
				! hasManagePluginsFeature &&
				__( 'Requires a Business Plan' )
			}
		>
			{ label }
		</MenuItemLink>
	);
};

const HostingConfigItem = ( { site, recordTracks }: SitesMenuItemProps ) => {
	const { __ } = useI18n();

	return (
		<MenuItemLink
			href={ getHostingConfigUrl( site.slug ) }
			onClick={ () => recordTracks( 'calypso_sites_dashboard_site_action_hosting_config_click' ) }
		>
			{ __( 'Hosting configuration' ) }
		</MenuItemLink>
	);
};

const ModalContent = styled.div( {
	padding: 16,
	width: '80vw',
	maxWidth: '480px',
	minHeight: '100px',
	display: 'flex',
	flexDirection: 'column',
} );

const modalOverlayClassName = css( {
	// golbal-notices has z-index: 179
	zIndex: 178,
} );

function useSafeSiteHasFeature( siteId: number, feature: string ) {
	const dispatch = useReduxDispatch();
	useEffect( () => {
		dispatch( fetchSiteFeatures( siteId ) );
	}, [ dispatch, siteId ] );

	return useSelector( ( state ) => {
		return siteHasFeature( state, siteId, feature );
	} );
}

const PreviewSiteModalItem = ( { recordTracks, site }: SitesMenuItemProps ) => {
	const { __ } = useI18n();
	const [ isVisible, setIsVisible ] = useState( false );
	const openModal = () => setIsVisible( true );
	const closeModal = () => setIsVisible( false );

	const onSitePreviewClick = () => {
		recordTracks( 'calypso_sites_dashboard_site_action_preview_link_click' );
		openModal();
	};

	const hasSitePreviewLinksFeature = useSafeSiteHasFeature(
		site.ID,
		WPCOM_FEATURES_SITE_PREVIEW_LINKS
	);

	if ( ! hasSitePreviewLinksFeature ) {
		return null;
	}

	return (
		<>
			<MenuItemLink onClick={ onSitePreviewClick }>{ __( 'Share site for preview' ) }</MenuItemLink>
			{ isVisible && (
				<Modal
					title={ __( 'Share site for preview' ) }
					onRequestClose={ closeModal }
					overlayClassName={ modalOverlayClassName }
				>
					<ModalContent>
						<SitePreviewLink siteUrl={ site.URL } siteId={ site.ID } source="smp-modal" />
					</ModalContent>
				</Modal>
			) }
		</>
	);
};

const CopySiteItem = ( { recordTracks, site, onClick }: SitesMenuItemProps ) => {
	const { __ } = useI18n();

	const copySiteHref = addQueryArgs( `/setup/copy-site`, {
		sourceSlug: site.slug,
	} );
	return (
		<MenuItemLink
			href={ copySiteHref }
			onClick={ () => {
				recordTracks( 'calypso_sites_dashboard_site_action_copy_site_click' );
				onClick?.();
			} }
		>
			{ __( 'Copy site' ) }
		</MenuItemLink>
	);
};

const MenuItemGridIcon = styled( Gridicon )( {
	insetBlockStart: '-1px',
	marginLeft: 'auto',
	position: 'relative',
} );

const WpAdminItem = ( { site, recordTracks }: SitesMenuItemProps ) => {
	const { __ } = useI18n();

	return (
		<MenuItemLink
			href={ site.options?.admin_url }
			onClick={ () => recordTracks( 'calypso_sites_dashboard_site_action_wpadmin_click' ) }
		>
			{ __( 'Visit WP Admin' ) } <MenuItemGridIcon icon="external" size={ 18 } />
		</MenuItemLink>
	);
};

const SiteMenuGroup = styled( MenuGroup )( {
	'> div[role="group"]': {
		display: 'flex',
		flexDirection: 'column',
	},
} );

const SiteDropdownMenu = styled( DropdownMenu )( {
	'> .components-button': {
		padding: 0,
		minWidth: 0,
		color: 'var( --color-text-subtle )',
		height: 'auto',
		verticalAlign: 'middle',
	},
	'.components-popover': {
		zIndex: 177,
	},

	'.submenu-popover > .components-popover__content': {
		display: 'flex',
		flexDirection: 'column',
	},
} );

function useSubmenuItems( site: SiteExcerptData ) {
	const { __ } = useI18n();
	const siteSlug = site.slug;

	return useMemo< { label: string; href: string; sectionName: string }[] >( () => {
		return [
			{
				label: __( 'SFTP/SSH credentials' ),
				href: `/hosting-config/${ siteSlug }#sftp-credentials`,
				sectionName: 'sftp_credentials',
			},
			{
				label: __( 'Database access' ),
				href: `/hosting-config/${ siteSlug }#database-access`,
				sectionName: 'database_access',
			},
			{
				label: __( 'Deploy from GitHub' ),
				href: `/hosting-config/${ siteSlug }#connect-github`,
				sectionName: 'connect_github',
			},
			{
				label: __( 'Web server settings' ),
				href: `/hosting-config/${ siteSlug }#web-server-settings`,
				sectionName: 'web_server_settings',
			},
			{
				label: __( 'Clear cache' ),
				href: `/hosting-config/${ siteSlug }#cache`,
				sectionName: 'cache',
			},
			{
				label: __( 'Web server logs' ),
				href: `/hosting-config/${ siteSlug }#web-server-logs`,
				sectionName: 'logs',
			},
		];
	}, [ __, siteSlug ] );
}

function HostingConfigurationSubmenu( { site, recordTracks }: SitesMenuItemProps ) {
	const { __ } = useI18n();
	const hasFeatureSFTP = useSafeSiteHasFeature( site.ID, FEATURE_SFTP );
	const displayUpsell = ! hasFeatureSFTP;
	const submenuItems = useSubmenuItems( site );
	const onSubmenuIsVisible = useCallback( () => {
		recordTracks( 'calypso_sites_dashboard_site_action_hosting_config_submenu_open', {
			display_upsell: displayUpsell,
			product_slug: site.plan?.product_slug,
		} );
	}, [ displayUpsell, recordTracks, site.plan?.product_slug ] );
	const developerSubmenuProps = useSubmenuPopoverProps< HTMLDivElement >( {
		offsetTop: -8,
		onVisible: onSubmenuIsVisible,
	} );

	useEffect( () => {
		recordTracks( 'calypso_sites_dashboard_site_action_hosting_config_view', {
			display_upsell: displayUpsell,
			product_slug: site.plan?.product_slug,
		} );
	}, [ displayUpsell, recordTracks, site.plan?.product_slug ] );

	if ( submenuItems.length === 0 ) {
		return null;
	}

	return (
		<div { ...developerSubmenuProps.parent }>
			<MenuItemLink
				href={ getHostingConfigUrl( site.slug ) }
				onClick={ () => recordTracks( 'calypso_sites_dashboard_site_action_hosting_config_click' ) }
				info={ ! displayUpsell && __( 'Requires a Business Plan' ) }
			>
				{ __( 'Hosting configuration' ) } <MenuItemGridIcon icon="chevron-right" size={ 18 } />
			</MenuItemLink>
			<SubmenuPopover
				{ ...developerSubmenuProps.submenu }
				focusOnMount={ displayUpsell ? 'firstElement' : false }
			>
				{ displayUpsell ? (
					submenuItems.map( ( item ) => (
						<MenuItemLink
							key={ item.label }
							href={ item.href }
							onClick={ () =>
								recordTracks( 'calypso_sites_dashboard_site_action_hosting_config_submenu_click', {
									section: item.sectionName,
								} )
							}
						>
							{ item.label }
						</MenuItemLink>
					) )
				) : (
					<UpsellMenuGroup>
						{ __(
							'Upgrade to the Business Plan to enable SFTP & SSH, database access, GitHub deploys, and more…'
						) }
						<Button
							compact
							primary
							href={ getHostingConfigUrl( site.slug ) }
							onClick={ () =>
								recordTracks( 'calypso_sites_dashboard_site_action_hosting_config_upsell_click' )
							}
						>
							{ __( 'Check full feature list' ) }
						</Button>
					</UpsellMenuGroup>
				) }
			</SubmenuPopover>
		</div>
	);
}

export const SitesEllipsisMenu = ( {
	className,
	site,
}: {
	className?: string;
	site: SiteExcerptData;
} ) => {
	const dispatch = useReduxDispatch();
	const { __ } = useI18n();
	function recordTracks( eventName: string, extraProps = {} ) {
		dispatch( recordTracksEvent( eventName, extraProps ) );
	}
	const props: SitesMenuItemProps = {
		site,
		recordTracks,
	};

	const hasHostingPage = ! isNotAtomicJetpack( site ) && ! isP2Site( site );
	const { shouldShowSiteCopyItem, startSiteCopy } = useSiteCopy( site );
	const hasCustomDomain = isCustomDomain( site.slug );
	const isLaunched = site.launch_status !== 'unlaunched';

	return (
		<SiteDropdownMenu
			icon={ <Gridicon icon="ellipsis" /> }
			className={ className }
			label={ __( 'Site Actions' ) }
		>
			{ () => (
				<SiteMenuGroup>
					{ ! isLaunched && <LaunchItem { ...props } /> }
					<SettingsItem { ...props } />
					{ isEnabled( 'dev/developer-ux' ) && hasHostingPage && (
						<HostingConfigurationSubmenu { ...props } />
					) }
					{ ! isP2Site( site ) && <ManagePluginsItem { ...props } /> }
					{ ! isEnabled( 'dev/developer-ux' ) && hasHostingPage && (
						<HostingConfigItem { ...props } />
					) }
					{ site.is_coming_soon && <PreviewSiteModalItem { ...props } /> }
					{ shouldShowSiteCopyItem && <CopySiteItem { ...props } onClick={ startSiteCopy } /> }
					<MenuItemLink
						href={ `/settings/performance/${ site.slug }` }
						onClick={ () =>
							recordTracks(
								'calypso_sites_dashboard_site_action_submenu_performance_settings_click'
							)
						}
					>
						{ __( 'Performance settings' ) }
					</MenuItemLink>
					{ isLaunched && (
						<MenuItemLink
							href={ `/settings/general/${ site.slug }#site-privacy-settings` }
							onClick={ () =>
								recordTracks( 'calypso_sites_dashboard_site_action_submenu_privacy_settings_click' )
							}
						>
							{ __( 'Privacy settings' ) }
						</MenuItemLink>
					) }
					{ hasCustomDomain && (
						<MenuItemLink
							href={ `/domains/manage/${ site.slug }/dns/${ site.slug }` }
							onClick={ () =>
								recordTracks( 'calypso_sites_dashboard_site_action_submenu_dns_records_click' )
							}
						>
							{ __( 'Domains and DNS' ) }
						</MenuItemLink>
					) }
					<WpAdminItem { ...props } />
				</SiteMenuGroup>
			) }
		</SiteDropdownMenu>
	);
};
