import { Icon, link, linkOff, trash } from '@wordpress/icons';
import { translate } from 'i18n-calypso';
import { navigate } from 'calypso/lib/navigate';
import {
	ACTIVATE_PLUGIN,
	DEACTIVATE_PLUGIN,
	ENABLE_AUTOUPDATE_PLUGIN,
	DISABLE_AUTOUPDATE_PLUGIN,
} from 'calypso/lib/plugins/constants';
import { PluginActionTypes } from 'calypso/my-sites/plugins/plugin-management-v2/types';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { Plugin, PluginSite } from 'calypso/state/plugins/installed/types';
import { PluginActions } from '../hooks/types';

export function useActions(
	bulkActionDialog: ( action: string, plugins: Array< Plugin > ) => void
) {
	const dispatch = useDispatch();
	const recordIntentionEvent = ( plugins: Array< Plugin >, action: string ) => {
		/**
		 * There's currently no better way to differentiate between bulk and single action clicks.
		 */
		const eventName =
			plugins.length > 1
				? 'calypso_plugins_manage_list_bulk_action_click'
				: 'calypso_plugins_manage_list_action_click';

		dispatch( recordTracksEvent( eventName, { action } ) );
	};

	const actionInProgress = ( plugin: Plugin, action: PluginActionTypes ) => {
		return plugin?.allStatuses?.find(
			( status ) => status.action === action && status.status === 'inProgress'
		);
	};

	const someSiteHasStatus = ( plugin: Plugin, field: keyof PluginSite, value: boolean ) => {
		return Object.values( plugin.sites )?.some( ( site ) => site[ field ] === value );
	};

	const actions = [
		{
			id: 'manage-plugin',
			href: `some-url`,
			callback: ( plugins: Array< Plugin > ) => {
				recordIntentionEvent( plugins, 'manage-plugin' );
				plugins.length && navigate( '/plugins/' + plugins[ 0 ].slug );
			},
			label: translate( 'Manage Plugin' ),
			isExternalLink: true,
			isEnabled: true,
			supportsBulk: false,
		},
		{
			id: 'activate-plugin',
			href: `some-url`,
			callback: ( plugins: Array< Plugin > ) => {
				recordIntentionEvent( plugins, 'activate-plugin' );
				bulkActionDialog( PluginActions.ACTIVATE, plugins );
			},
			label: translate( 'Activate' ),
			isExternalLink: true,
			isEligible( plugin: Plugin ) {
				return (
					! actionInProgress( plugin, ACTIVATE_PLUGIN ) &&
					someSiteHasStatus( plugin, 'active', false )
				);
			},
			supportsBulk: true,
			icon: <Icon icon={ link } />,
		},
		{
			id: 'deactivate-plugin',
			href: `some-url`,
			callback: ( plugins: Array< Plugin > ) => {
				recordIntentionEvent( plugins, 'deactivate-plugin' );
				bulkActionDialog( PluginActions.DEACTIVATE, plugins );
			},
			label: translate( 'Deactivate' ),
			isExternalLink: true,
			isEligible( plugin: Plugin ) {
				return (
					! actionInProgress( plugin, DEACTIVATE_PLUGIN ) &&
					someSiteHasStatus( plugin, 'active', true )
				);
			},
			supportsBulk: true,
			icon: <Icon icon={ linkOff } />,
		},
		{
			id: 'enable-autoupdate',
			href: `some-url`,
			callback: ( plugins: Array< Plugin > ) => {
				recordIntentionEvent( plugins, 'enable-autoupdate' );
				bulkActionDialog( PluginActions.ENABLE_AUTOUPDATES, plugins );
			},
			label: translate( 'Enable auto-updates' ),
			isExternalLink: true,
			isEligible( plugin: Plugin ) {
				return (
					! actionInProgress( plugin, ENABLE_AUTOUPDATE_PLUGIN ) &&
					someSiteHasStatus( plugin, 'autoupdate', false )
				);
			},
			supportsBulk: true,
		},
		{
			id: 'disable-autoupdate',
			href: `some-url`,
			callback: ( plugins: Array< Plugin > ) => {
				recordIntentionEvent( plugins, 'disable-autoupdate' );
				bulkActionDialog( PluginActions.DISABLE_AUTOUPDATES, plugins );
			},
			label: translate( 'Disable auto-updates' ),
			isExternalLink: true,
			isEligible( plugin: Plugin ) {
				return (
					! actionInProgress( plugin, DISABLE_AUTOUPDATE_PLUGIN ) &&
					someSiteHasStatus( plugin, 'autoupdate', true )
				);
			},
			supportsBulk: true,
		},
		{
			id: 'remove-plugin',
			href: `some-url`,
			callback: ( plugins: Array< Plugin > ) => {
				recordIntentionEvent( plugins, 'remove-plugin' );
				bulkActionDialog( PluginActions.REMOVE, plugins );
			},
			label: translate( 'Remove' ),
			isExternalLink: true,
			isEnabled: true,
			supportsBulk: true,
			icon: <Icon icon={ trash } />,
		},
	];

	return actions;
}
