import { WPCOM_FEATURES_MANAGE_PLUGINS } from '@automattic/calypso-products';
import { Gridicon } from '@automattic/components';
import styled from '@emotion/styled';
import { DropdownMenu, MenuGroup, MenuItem } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { ComponentType } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { launchSiteOrRedirectToLaunchSignupFlow } from 'calypso/state/sites/launch/actions';
import { getHostingConfigUrl, getManagePluginsUrl, getPluginsUrl, getSettingsUrl } from '../utils';
import type { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';

interface SitesMenuItemProps {
	site: SiteExcerptData;
	recordTracks: ( eventName: string, extraProps?: Record< string, any > ) => void;
}

interface MenuItemLinkProps extends Omit< MenuItem.Props, 'href' > {
	href?: string;
}

const MenuItemLink = MenuItem as ComponentType< MenuItemLinkProps >;

const LaunchItem = ( { site, recordTracks }: SitesMenuItemProps ) => {
	const { __ } = useI18n();
	const dispatch = useDispatch();

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

const ExternalGridIcon = styled( Gridicon )( {
	top: '-1px',
	marginLeft: '4px',
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

export const SitesEllipsisMenu = ( {
	className,
	site,
}: {
	className?: string;
	site: SiteExcerptData;
} ) => {
	const dispatch = useDispatch();
	const { __ } = useI18n();
	const props: SitesMenuItemProps = {
		site,
		recordTracks: ( eventName, extraProps = {} ) => {
			dispatch( recordTracksEvent( eventName, extraProps ) );
		},
	};

	return (
		<DropdownMenu
			icon={ <Gridicon icon="ellipsis" /> }
			className={ className }
			label={ __( 'Site Actions' ) }
		>
			{ () => (
				<SiteMenuGroup>
					{ site.launch_status === 'unlaunched' && <LaunchItem { ...props } /> }
					<SettingsItem { ...props } />
					<ManagePluginsItem { ...props } />
					<HostingConfigItem { ...props } />
					<WpAdminItem { ...props } />
				</SiteMenuGroup>
			) }
		</DropdownMenu>
	);
};
