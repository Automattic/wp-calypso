import { isEnabled } from '@automattic/calypso-config';
import {
	WPCOM_FEATURES_MANAGE_PLUGINS,
	WPCOM_FEATURES_SITE_PREVIEW_LINKS,
} from '@automattic/calypso-products';
import { Gridicon, SubmenuPopover, useSubmenuPopoverProps } from '@automattic/components';
import { css } from '@emotion/css';
import styled from '@emotion/styled';
import { DropdownMenu, MenuGroup, MenuItem as CoreMenuItem, Modal } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { addQueryArgs } from '@wordpress/url';
import { ComponentType, useEffect, useMemo, useState } from 'react';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import SitePreviewLink from 'calypso/components/site-preview-link';
import { useSiteCopy } from 'calypso/landing/stepper/hooks/use-site-copy';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { fetchSiteFeatures } from 'calypso/state/sites/features/actions';
import { launchSiteOrRedirectToLaunchSignupFlow } from 'calypso/state/sites/launch/actions';
import { useUpsellInfo } from '../hooks/use-upsell-info';
import {
	getHostingConfigUrl,
	getManagePluginsUrl,
	getPluginsUrl,
	getSettingsUrl,
	isCustomDomain,
	isNotAtomicJetpack,
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
	const hasManagePluginsFeature = useSelector( ( state ) =>
		siteHasFeature( state, site.ID, WPCOM_FEATURES_MANAGE_PLUGINS )
	);
	const upsellInfo = useUpsellInfo( site );

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
			info={ upsellInfo }
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
	const hasCustomDomain = isCustomDomain( site.slug );
	const isLaunched = site.launch_status !== 'unlaunched';
	const upsellInfo = useUpsellInfo( site );

	return useMemo<
		{ label: string; href: string; eventName: string; info?: string; condition?: boolean }[]
	>( () => {
		return [
			{
				info: upsellInfo,
				label: __( 'SFTP/SSH credentials' ),
				href: `/hosting-config/${ siteSlug }#sftp-credentials`,
				eventName: 'calypso_sites_dashboard_site_action_submenu_sftp_credentials_click',
			},
			{
				info: upsellInfo,
				label: __( 'Database access' ),
				href: `/hosting-config/${ siteSlug }#database-access`,
				eventName: 'calypso_sites_dashboard_site_action_submenu_database_access_click',
			},
			{
				info: upsellInfo,
				label: __( 'Github connection' ),
				href: `/hosting-config/${ siteSlug }#connect-github`,
				eventName: 'calypso_sites_dashboard_site_action_submenu_connect_github_click',
			},
			{
				info: upsellInfo,
				label: __( 'Web server settings' ),
				href: `/hosting-config/${ siteSlug }#web-server-settings`,
				eventName: 'calypso_sites_dashboard_site_action_submenu_web_server_settings_click',
			},
			{
				info: upsellInfo,
				label: __( 'Clear cache' ),
				href: `/hosting-config/${ siteSlug }#cache`,
				eventName: 'calypso_sites_dashboard_site_action_submenu_cache_click',
			},
			{
				label: __( 'Performance settings' ),
				href: `/settings/performance/${ siteSlug }`,
				eventName: 'calypso_sites_dashboard_site_action_submenu_performance_settings_click',
			},
			{
				condition: isLaunched,
				label: __( 'Privacy settings' ),
				href: `/settings/general/${ siteSlug }#site-privacy-settings`,
				eventName: 'calypso_sites_dashboard_site_action_submenu_privacy_settings_click',
			},
			{
				condition: hasCustomDomain,
				label: __( 'DNS records' ),
				href: `/domains/manage/${ siteSlug }/dns/${ siteSlug }`,
				eventName: 'calypso_sites_dashboard_site_action_submenu_dns_records_click',
			},
		].filter( ( { condition } ) => condition ?? true );
	}, [ __, siteSlug, hasCustomDomain, isLaunched, upsellInfo ] );
}

function DeveloperSettingsSubmenu( { site, recordTracks }: SitesMenuItemProps ) {
	const { __ } = useI18n();
	const submenuItems = useSubmenuItems( site );
	const developerSubmenuProps = useSubmenuPopoverProps< HTMLDivElement >( { offsetTop: -8 } );

	if ( submenuItems.length === 0 ) {
		return null;
	}

	return (
		<div { ...developerSubmenuProps.parent }>
			<MenuItemLink>
				{ __( 'Developer settings' ) } <MenuItemGridIcon icon="chevron-right" size={ 18 } />
			</MenuItemLink>
			<SubmenuPopover { ...developerSubmenuProps.submenu }>
				{ submenuItems.map( ( item ) => (
					<MenuItemLink
						key={ item.label }
						href={ item.href }
						onClick={ () => recordTracks( item.eventName ) }
						info={ item.info }
					>
						{ item.label }
					</MenuItemLink>
				) ) }
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
	const props: SitesMenuItemProps = {
		site,
		recordTracks: ( eventName, extraProps = {} ) => {
			dispatch( recordTracksEvent( eventName, extraProps ) );
		},
	};

	const showHosting = ! isNotAtomicJetpack( site ) && ! site.options?.is_wpforteams_site;
	const { shouldShowSiteCopyItem, startSiteCopy } = useSiteCopy( site );

	return (
		<SiteDropdownMenu
			icon={ <Gridicon icon="ellipsis" /> }
			className={ className }
			label={ __( 'Site Actions' ) }
		>
			{ () => (
				<SiteMenuGroup>
					{ site.launch_status === 'unlaunched' && <LaunchItem { ...props } /> }
					<SettingsItem { ...props } />
					{ isEnabled( 'dev/developer-ux' ) && <DeveloperSettingsSubmenu { ...props } /> }
					<ManagePluginsItem { ...props } />
					{ showHosting && <HostingConfigItem { ...props } /> }
					{ site.is_coming_soon && <PreviewSiteModalItem { ...props } /> }
					{ shouldShowSiteCopyItem && <CopySiteItem { ...props } onClick={ startSiteCopy } /> }
					<WpAdminItem { ...props } />
				</SiteMenuGroup>
			) }
		</SiteDropdownMenu>
	);
};
