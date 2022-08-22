import { WPCOM_FEATURES_MANAGE_PLUGINS } from '@automattic/calypso-products';
import { css } from '@emotion/css';
import { useI18n } from '@wordpress/react-i18n';
import { useDispatch, useSelector } from 'react-redux';
import EllipsisMenu from 'calypso/components/ellipsis-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { launchSiteOrRedirectToLaunchSignupFlow } from 'calypso/state/sites/launch/actions';
import { getHostingConfigUrl, getManagePluginsUrl, getPluginsUrl, getSettingsUrl } from '../utils';
import type { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';

interface SitesMenuItemProps {
	site: SiteExcerptData;
	recordTracks: ( eventName: string, extraProps?: Record< string, any > ) => void;
}

const LaunchItem = ( { site, recordTracks }: SitesMenuItemProps ) => {
	const { __ } = useI18n();
	const dispatch = useDispatch();

	return (
		<PopoverMenuItem
			onClick={ () => {
				dispatch( launchSiteOrRedirectToLaunchSignupFlow( site.ID, 'sites-dashboard' ) );
				recordTracks( 'calypso_sites_dashboard_site_action_launch_click' );
			} }
		>
			{ __( 'Launch site' ) }
		</PopoverMenuItem>
	);
};

const SettingsItem = ( { site, recordTracks }: SitesMenuItemProps ) => {
	const { __ } = useI18n();

	return (
		<PopoverMenuItem
			href={ getSettingsUrl( site.slug ) }
			onClick={ () => recordTracks( 'calypso_sites_dashboard_site_action_settings_click' ) }
		>
			{ __( 'Settings' ) }
		</PopoverMenuItem>
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
		<PopoverMenuItem
			href={ href }
			onClick={ () =>
				recordTracks( 'calypso_sites_dashboard_site_action_plugins_click', {
					has_manage_plugins_feature: hasManagePluginsFeature,
				} )
			}
		>
			{ label }
		</PopoverMenuItem>
	);
};

const HostingConfigItem = ( { site, recordTracks }: SitesMenuItemProps ) => {
	const { __ } = useI18n();

	return (
		<PopoverMenuItem
			href={ getHostingConfigUrl( site.slug ) }
			onClick={ () => recordTracks( 'calypso_sites_dashboard_site_action_hosting_config_click' ) }
		>
			{ __( 'Hosting configuration' ) }
		</PopoverMenuItem>
	);
};

const alignExternalIcon = css`
	.gridicons-external {
		top: 0px;
	}
`;

const WpAdminItem = ( { site, recordTracks }: SitesMenuItemProps ) => {
	const { __ } = useI18n();

	return (
		<PopoverMenuItem
			className={ alignExternalIcon }
			href={ site.options?.admin_url }
			isExternalLink
			onClick={ () => recordTracks( 'calypso_sites_dashboard_site_action_wpadmin_click' ) }
		>
			{ __( 'Visit WP Admin' ) }
		</PopoverMenuItem>
	);
};

export const SitesEllipsisMenu = ( {
	className,
	site,
}: {
	className?: string;
	site: SiteExcerptData;
} ) => {
	const dispatch = useDispatch();
	const props: SitesMenuItemProps = {
		site,
		recordTracks: ( eventName, extraProps = {} ) => {
			dispatch( recordTracksEvent( eventName, extraProps ) );
		},
	};

	return (
		<EllipsisMenu className={ className }>
			{ site.launch_status === 'unlaunched' && <LaunchItem { ...props } /> }
			<SettingsItem { ...props } />
			<ManagePluginsItem { ...props } />
			<HostingConfigItem { ...props } />
			<WpAdminItem { ...props } />
		</EllipsisMenu>
	);
};
