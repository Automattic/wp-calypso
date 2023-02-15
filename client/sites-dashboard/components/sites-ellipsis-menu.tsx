import {
	WPCOM_FEATURES_MANAGE_PLUGINS,
	WPCOM_FEATURES_SITE_PREVIEW_LINKS,
} from '@automattic/calypso-products';
import { Gridicon, SubmenuPopover, useSubenuPopoverProps } from '@automattic/components';
import { css } from '@emotion/css';
import styled from '@emotion/styled';
import { DropdownMenu, MenuGroup, MenuItem as CoreMenuItem, Modal } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { addQueryArgs } from '@wordpress/url';
import { ComponentType, useEffect, useMemo, useState } from 'react';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import SitePreviewLink from 'calypso/components/site-preview-link';
import { useSiteCopy } from 'calypso/landing/stepper/hooks/use-site-copy';
import { useInView } from 'calypso/lib/use-in-view';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { fetchSiteFeatures } from 'calypso/state/sites/features/actions';
import { launchSiteOrRedirectToLaunchSignupFlow } from 'calypso/state/sites/launch/actions';
import {
	getHostingConfigUrl,
	getManagePluginsUrl,
	getPluginsUrl,
	getSettingsUrl,
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

const ExternalGridIcon = styled( Gridicon )( {
	insetBlockStart: '-1px',
	marginInlineStart: '4px',
	position: 'relative',
} );

const WpAdminItem = ( { site, recordTracks }: SitesMenuItemProps ) => {
	const { __ } = useI18n();

	return (
		<MenuItemLink
			href={ site.options?.admin_url }
			onClick={ () => recordTracks( 'calypso_sites_dashboard_site_action_wpadmin_click' ) }
		>
			{ __( 'Visit WP Admin' ) } <ExternalGridIcon icon="external" size={ 18 } />
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

function useSubmenuItems( siteSlug: string ) {
	const { __ } = useI18n();
	return useMemo(
		() => [
			{
				label: __( 'privacy-settings' ),
				href: `/settings/general/${ siteSlug }#site-privacy-settings`,
			},
			{
				label: __( 'database-access' ),
				href: `/hosting-config/${ siteSlug }#database-access`,
			},
			{
				label: __( 'sftp-credentials' ),
				href: `/hosting-config/${ siteSlug }#sftp-credentials`,
			},
			{
				label: __( '/hostingserver-settings' ),
				href: `/hosting-config/${ siteSlug }#web-server-settings`,
			},
			{
				label: __( 'connect-github' ),
				href: `/hosting-config/${ siteSlug }#connect-github`,
			},
		],
		[ __, siteSlug ]
	);
}

function DeveloperSettings( { siteSlug }: { siteSlug: string } ) {
	const { __ } = useI18n();
	const submenuItems = useSubmenuItems( siteSlug );
	const developerSubmenuProps = useSubenuPopoverProps< HTMLDivElement >();

	return (
		<div { ...developerSubmenuProps.parent }>
			<MenuItemLink>{ __( 'Developer settings' ) }</MenuItemLink>
			<SubmenuPopover { ...developerSubmenuProps.submenu }>
				{ submenuItems.map( ( item ) => (
					<MenuItemLink key={ item.label } href={ item.href }>
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
	const [ inViewOnce, setInViewOnce ] = useState( false );
	const ref = useInView< HTMLTableCellElement >( () => setInViewOnce( true ) );

	const { __ } = useI18n();
	const props: SitesMenuItemProps = {
		site,
		recordTracks: ( eventName, extraProps = {} ) => {
			dispatch( recordTracksEvent( eventName, extraProps ) );
		},
	};

	const showHosting = ! isNotAtomicJetpack( site ) && ! site.options?.is_wpforteams_site;
	const { shouldShowSiteCopyItem, startSiteCopy } = useSiteCopy( site, { enabled: inViewOnce } );

	return (
		<div ref={ ref }>
			<SiteDropdownMenu
				icon={ <Gridicon icon="ellipsis" /> }
				className={ className }
				label={ __( 'Site Actions' ) }
			>
				{ () => (
					<SiteMenuGroup>
						{ site.launch_status === 'unlaunched' && <LaunchItem { ...props } /> }
						<SettingsItem { ...props } />
						<ManagePluginsItem { ...props } />
						{ showHosting && <HostingConfigItem { ...props } /> }
						{ site.is_coming_soon && <PreviewSiteModalItem { ...props } /> }
						{ shouldShowSiteCopyItem && <CopySiteItem { ...props } onClick={ startSiteCopy } /> }
						<WpAdminItem { ...props } />
						<DeveloperSettings siteSlug={ site.slug } />
					</SiteMenuGroup>
				) }
			</SiteDropdownMenu>
		</div>
	);
};
