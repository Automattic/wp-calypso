import { Site } from '@automattic/api-core';
import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	Button,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __, _n, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useEffect, useState } from 'react';
import { useAnalytics } from '../../../app/analytics';
import { useSitesById } from '../hooks/use-sites-by-id';
import type { PluginListRow } from '../types';
import type { RenderModalProps } from '@wordpress/dataviews';

export type ActionOnExecuteResponse = {
	successCount: number;
	errorCount: number;
};

export type ActionRenderModalProps = RenderModalProps< PluginListRow > & {
	actionId: string;
	extraActions?: string[];
	listItems?: boolean;
	// Function that executes the underlying action (e.g., existing callback)
	onExecute: ( items: PluginListRow[] ) => Promise< ActionOnExecuteResponse >;
};

function getConfirmButtonLabel( actionId: string ) {
	switch ( actionId ) {
		case 'activate':
			return __( 'Activate' );
		case 'deactivate':
			return __( 'Deactivate' );
		case 'update':
			return __( 'Update' );
		case 'enable-autoupdate':
			return __( 'Enable auto‑updates' );
		case 'disable-autoupdate':
			return __( 'Disable auto‑updates' );
		case 'delete':
			return __( 'Delete' );
		default:
			return __( 'Confirm' );
	}
}

export function getModalHeader( actionId: string ) {
	switch ( actionId ) {
		case 'activate':
			return __( 'Activate plugin' );
		case 'deactivate':
			return __( 'Deactivate plugin' );
		case 'update':
			return __( 'Update plugin' );
		case 'enable-autoupdate':
			return __( 'Enable plugin auto‑updates' );
		case 'disable-autoupdate':
			return __( 'Disable plugin auto‑updates' );
		case 'delete':
			return __( 'Remove plugin' );
		default:
			return __( 'Confirm action' );
	}
}

function getConfirmText( actionId: string, extraActions: string[], items: PluginListRow[] ) {
	const pluginName = items[ 0 ].name;
	const count = items[ 0 ].sitesCount;
	switch ( actionId ) {
		case 'activate': {
			const inactiveCount = items[ 0 ].sitesWithPluginInactive.length;
			return sprintf(
				// translators: %1$s is the plugin name. %2$d is the number of sites.
				_n(
					'You are about to activate the %1$s plugin on %2$d site.',
					'You are about to activate the %1$s plugin on %2$d sites.',
					inactiveCount
				),
				pluginName,
				inactiveCount
			);
		}
		case 'deactivate': {
			const activeCount = items[ 0 ].sitesWithPluginActive.length;
			return sprintf(
				// Translators: %1$s is the plugin name. %2$d is the number of sites.
				_n(
					'You are about to deactivate the %1$s plugin installed on %2$d site.',
					'You are about to deactivate the %1$s plugin installed on %2$d sites.',
					activeCount
				),
				pluginName,
				activeCount
			);
		}
		case 'update': {
			const updateCount = items[ 0 ].sitesWithPluginUpdate.length;
			return sprintf(
				// Translators: %1$s is the plugin name. %2$d is the number of sites.
				_n(
					'You are about to update the %1$s plugin installed on %2$d site.',
					'You are about to update the %1$s plugin installed on %2$d sites.',
					updateCount
				),
				pluginName,
				updateCount
			);
		}
		case 'enable-autoupdate': {
			const disabledCount = items[ 0 ].sitesWithPluginNotAutoupdated.length;
			return sprintf(
				// Translators: %1$s is the plugin name. %2$d is the number of sites.
				_n(
					'You are about to enable auto‑updates for the %1$s plugin installed on %2$d site.',
					'You are about to enable auto‑updates for the %1$s plugin installed on %2$d sites.',
					disabledCount
				),
				pluginName,
				disabledCount
			);
		}
		case 'disable-autoupdate': {
			const enabledCount = items[ 0 ].sitesWithPluginAutoupdated.length;
			return sprintf(
				// Translators: %1$s is the plugin name. %2$d is the number of sites.
				_n(
					'You are about to disable auto‑updates for the %1$s plugin installed on %2$d site.',
					'You are about to disable auto‑updates for the %1$s plugin installed on %2$d sites.',
					enabledCount
				),
				pluginName,
				enabledCount
			);
		}
		case 'delete':
			if (
				extraActions.includes( 'deactivate' ) &&
				extraActions.includes( 'disable-autoupdate' )
			) {
				return sprintf(
					// Translators: %1$s is the plugin name. %2$d is the number of sites.
					_n(
						'You are about to deactivate, disable auto‑updates, and remove the %1$s plugin installed on %2$d site.',
						'You are about to deactivate, disable auto‑updates, and remove the %1$s plugin installed on %2$d sites.',
						count
					),
					pluginName,
					count
				);
			}

			if ( extraActions.includes( 'deactivate' ) ) {
				return sprintf(
					// Translators: %1$s is the plugin name. %2$d is the number of sites.
					_n(
						'You are about to deactivate and remove the %1$s plugin installed on %2$d site.',
						'You are about to deactivate and remove the %1$s plugin installed on %2$d sites.',
						count
					),
					pluginName,
					count
				);
			}

			if ( extraActions.includes( 'disable-autoupdate' ) ) {
				return sprintf(
					// Translators: %1$s is the plugin name. %2$d is the number of sites.
					_n(
						'You are about to disable auto‑updates and remove the %1$s plugin installed on %2$d site.',
						'You are about to disable auto‑updates and remove the %1$s plugin installed on %2$d sites.',
						count
					),
					pluginName,
					count
				);
			}

			return sprintf(
				// Translators: %1$s is the plugin name. %2$d is the number of sites.
				_n(
					'You are about to remove the %1$s plugin installed on %2$d site.',
					'You are about to remove the %1$s plugin installed on %2$d sites.',
					count
				),
				pluginName,
				count
			);
		default:
			return __( 'You are about to perform this action.' );
	}
}

function getSiteList( actionId: string, items: PluginListRow[], sitesById: Map< number, Site > ) {
	if ( items.length !== 1 ) {
		return null;
	}

	const [ plugin ] = items;

	let sites: number[] = [];
	switch ( actionId ) {
		case 'activate':
			sites = plugin.sitesWithPluginInactive;
			break;
		case 'deactivate':
			sites = plugin.sitesWithPluginActive;
			break;
		case 'update':
			sites = plugin.sitesWithPluginUpdate;
			break;
		case 'enable-autoupdate':
			sites = plugin.sitesWithPluginNotAutoupdated;
			break;
		case 'disable-autoupdate':
			sites = plugin.sitesWithPluginAutoupdated;
			break;
		case 'delete':
			sites = plugin.siteIds;
			break;
		default:
			return null;
	}

	if ( ! sites?.length ) {
		return null;
	}

	return (
		<ul>
			{ sites.map( ( siteId ) => {
				const site = sitesById.get( siteId );

				if ( ! site ) {
					return null;
				}

				return <li key={ siteId }>{ `${ site.name } (${ site.slug })` }</li>;
			} ) }
		</ul>
	);
}

export default function ActionRenderModal( {
	items,
	closeModal,
	onActionPerformed,
	actionId,
	extraActions = [],
	onExecute,
}: ActionRenderModalProps ) {
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const [ isBusy, setIsBusy ] = useState( false );
	const { recordTracksEvent } = useAnalytics();
	const { sitesById } = useSitesById();

	useEffect( () => {
		recordTracksEvent( 'calypso_dashboard_plugins_action_click', { action_id: actionId } );
	}, [ actionId, recordTracksEvent ] );

	const handleCancel = () => {
		recordTracksEvent( 'calypso_dashboard_plugins_action_cancel_click', {
			action_id: actionId,
		} );
		closeModal?.();
	};

	const buildSuccessMessage = ( action: string, selected: PluginListRow[], siteCount: number ) => {
		const pluginName = selected[ 0 ].name;
		switch ( action ) {
			case 'activate':
				return sprintf(
					// translators: %1$s is the plugin name, %2$d is the number of sites.
					_n( 'Activated %1$s on %2$d site', 'Activated %1$s on %2$d sites', siteCount ),
					pluginName,
					siteCount
				);
			case 'deactivate':
				return sprintf(
					// translators: %1$s is the plugin name, %2$d is the number of sites.
					_n( 'Deactivated %1$s on %2$d site', 'Deactivated %1$s on %2$d sites', siteCount ),
					pluginName,
					siteCount
				);
			case 'update':
				return sprintf(
					// translators: %1$s is the plugin name, %2$d is the number of sites.
					_n( 'Updated %1$s on %2$d site', 'Updated %1$s on %2$d sites', siteCount ),
					pluginName,
					siteCount
				);
			case 'enable-autoupdate':
				return sprintf(
					// translators: %1$s is the plugin name, %2$d is the number of sites.
					_n( 'Enabled auto‑updates for %1$s on %2$d site', 'Enabled auto‑updates for %1$s on %2$d sites', siteCount ),
					pluginName,
					siteCount
				);
			case 'disable-autoupdate':
				return sprintf(
					// translators: %1$s is the plugin name, %2$d is the number of sites.
					_n( 'Disabled auto‑updates for %1$s on %2$d site', 'Disabled auto‑updates for %1$s on %2$d sites', siteCount ),
					pluginName,
					siteCount
				);
			case 'delete':
				return sprintf(
					// translators: %1$s is the plugin name, %2$d is the number of sites.
					_n( 'Deleted %1$s on %2$d site', 'Deleted %1$s on %2$d sites', siteCount ),
					pluginName,
					siteCount
				);
			default:
				return sprintf(
					// translators: %d is the number of sites.
					_n( 'Action completed on %d site', 'Action completed on %d sites', siteCount ),
					siteCount
				);
		}
	};

	const buildErrorMessage = ( action: string, selected: PluginListRow[], siteCount: number ) => {
		const pluginName = selected[ 0 ].name;
		switch ( action ) {
			case 'activate':
				return sprintf(
					// translators: %1$s is the plugin name, %2$d is the number of sites.
					_n( 'Failed to activate %1$s on %2$d site', 'Failed to activate %1$s on %2$d sites', siteCount ),
					pluginName,
					siteCount
				);
			case 'deactivate':
				return sprintf(
					// translators: %1$s is the plugin name, %2$d is the number of sites.
					_n( 'Failed to deactivate %1$s on %2$d site', 'Failed to deactivate %1$s on %2$d sites', siteCount ),
					pluginName,
					siteCount
				);
			case 'update':
				return sprintf(
					// translators: %1$s is the plugin name, %2$d is the number of sites.
					_n( 'Failed to update %1$s on %2$d site', 'Failed to update %1$s on %2$d sites', siteCount ),
					pluginName,
					siteCount
				);
			case 'enable-autoupdate':
				return sprintf(
					// translators: %1$s is the plugin name, %2$d is the number of sites.
					_n( 'Failed to enable auto‑updates for %1$s on %2$d site', 'Failed to enable auto‑updates for %1$s on %2$d sites', siteCount ),
					pluginName,
					siteCount
				);
			case 'disable-autoupdate':
				return sprintf(
					// translators: %1$s is the plugin name, %2$d is the number of sites.
					_n( 'Failed to disable auto‑updates for %1$s on %2$d site', 'Failed to disable auto‑updates for %1$s on %2$d sites', siteCount ),
					pluginName,
					siteCount
				);
			case 'delete':
				return sprintf(
					// translators: %1$s is the plugin name, %2$d is the number of sites.
					_n( 'Failed to delete %1$s on %2$d site', 'Failed to delete %1$s on %2$d sites', siteCount ),
					pluginName,
					siteCount
				);
			default:
				return sprintf(
					// translators: %d is the number of sites.
					_n( 'Action failed on %d site', 'Action failed on %d sites', siteCount ),
					siteCount
				);
		}
	};

	const handleConfirm = async () => {
		recordTracksEvent( 'calypso_dashboard_plugins_action_confirm_click', {
			action_id: actionId,
		} );
		setIsBusy( true );
		try {
			const { successCount, errorCount } = await onExecute( items );
			if ( successCount > 0 ) {
				createSuccessNotice( buildSuccessMessage( actionId, items, successCount ), {
					type: 'snackbar',
				} );
			}
			if ( errorCount > 0 ) {
				createErrorNotice( buildErrorMessage( actionId, items, errorCount ), {
					type: 'snackbar',
				} );
			}
			onActionPerformed?.( items );
		} finally {
			setIsBusy( false );
			closeModal?.();
		}
	};

	return (
		<VStack spacing={ 4 }>
			<Text>{ getConfirmText( actionId, extraActions, items ) }</Text>
			{ getSiteList( actionId, items, sitesById ) }
			<HStack justify="right">
				<Button
					__next40pxDefaultSize
					variant="tertiary"
					onClick={ handleCancel }
					disabled={ isBusy }
					accessibleWhenDisabled
				>
					{ __( 'Cancel' ) }
				</Button>
				<Button
					__next40pxDefaultSize
					variant="primary"
					onClick={ handleConfirm }
					isBusy={ isBusy }
					disabled={ isBusy }
					accessibleWhenDisabled
				>
					{ getConfirmButtonLabel( actionId ) }
				</Button>
			</HStack>
		</VStack>
	);
}
