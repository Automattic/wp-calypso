import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	Button,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';
import { __, _n, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useAnalytics } from '../../../app/analytics';
import type { PluginListRow } from '../types';
import type { RenderModalProps } from '@wordpress/dataviews';

export type ActionOnExecuteResponse = {
	successCount: number;
	errorCount: number;
};

export type ActionRenderModalProps = RenderModalProps< PluginListRow > & {
	actionId: string;
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
			return __( 'Deactivate and remove plugin' );
		default:
			return __( 'Confirm action' );
	}
}

function getConfirmText( actionId: string, items: PluginListRow[] ) {
	if ( items.length === 1 ) {
		const pluginName = items[ 0 ].name;
		const count = items[ 0 ].sitesCount;
		switch ( actionId ) {
			case 'activate':
				return sprintf(
					// translators: %1$s is the plugin name. %2$d is the number of sites.
					__( 'You are about to activate the %1$s plugin installed on %2$d sites.' ),
					pluginName,
					count
				);
			case 'deactivate':
				return sprintf(
					// Translators: %1$s is the plugin name. %2$d is the number of sites.
					__( 'You are about to deactivate the %1$s plugin installed on %2$d sites.' ),
					pluginName,
					count
				);
			case 'update':
				return sprintf(
					// Translators: %1$s is the plugin name. %2$d is the number of sites.
					__( 'You are about to update the %1$s plugin installed on %2$d sites.' ),
					pluginName,
					count
				);
			case 'enable-autoupdate':
				return sprintf(
					// Translators: %1$s is the plugin name. %2$d is the number of sites.
					__( 'You are about to enable auto‑updates for the %1$s plugin installed on %2$d sites.' ),
					pluginName,
					count
				);
			case 'disable-autoupdate':
				return sprintf(
					// Translators: %1$s is the plugin name. %2$d is the number of sites.
					__(
						'You are about to disable auto‑updates for the %1$s plugin installed on %2$d sites.'
					),
					pluginName,
					count
				);
			case 'delete':
				return sprintf(
					// Translators: %1$s is the plugin name. %2$d is the number of sites.
					__( 'You are about to deactivate and remove the %1$s plugin installed on %2$d sites.' ),
					pluginName,
					count
				);
			default:
				return __( 'You are about to perform this action.' );
		}
	}
	// Multi-select fallback
	switch ( actionId ) {
		case 'activate':
			return sprintf(
				// translators: %d is the number of selected plugins.
				_n(
					'You are about to activate %d selected plugin.',
					'You are about to activate %d selected plugins.',
					items.length,
					'next-admin'
				),
				items.length
			);
		case 'deactivate':
			return sprintf(
				// translators: %d is the number of selected plugins.
				_n(
					'You are about to deactivate %d selected plugin.',
					'You are about to deactivate %d selected plugins.',
					items.length,
					'next-admin'
				),
				items.length
			);
		case 'update':
			return sprintf(
				// translators: %d is the number of selected plugins.
				_n(
					'You are about to update %d selected plugin.',
					'You are about to update %d selected plugins.',
					items.length,
					'next-admin'
				),
				items.length
			);
		case 'enable-autoupdate':
			return sprintf(
				// translators: %d is the number of selected plugins.
				_n(
					'You are about to enable auto‑updates for %d selected plugin.',
					'You are about to enable auto‑updates for %d selected plugins.',
					items.length,
					'next-admin'
				),
				items.length
			);
		case 'disable-autoupdate':
			return sprintf(
				// translators: %d is the number of selected plugins.
				_n(
					'You are about to disable auto‑updates for %d selected plugin.',
					'You are about to disable auto‑updates for %d selected plugins.',
					items.length,
					'next-admin'
				),
				items.length
			);
		case 'delete':
			return sprintf(
				// translators: %d is the number of selected plugins.
				_n(
					'You are about to deactivate and remove %d selected plugin.',
					'You are about to deactivate and remove %d selected plugins.',
					items.length,
					'next-admin'
				),
				items.length
			);
		default:
			return __( 'You are about to perform this action.' );
	}
}

export default function ActionRenderModal( {
	items,
	closeModal,
	onActionPerformed,
	actionId,
	onExecute,
}: ActionRenderModalProps ) {
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const [ isBusy, setIsBusy ] = useState( false );
	const { recordTracksEvent } = useAnalytics();

	useEffect( () => {
		recordTracksEvent( `calypso_hosting_dashboard_plugins_${ actionId }_click` );
	}, [ actionId, recordTracksEvent ] );

	const handleCancel = () => {
		recordTracksEvent( `calypso_hosting_dashboard_plugins_${ actionId }_cancel_click` );
		closeModal?.();
	};

	const buildSuccessPrefix = ( action: string, selected: PluginListRow[] ) => {
		if ( selected.length === 1 ) {
			const pluginName = selected[ 0 ].name;
			switch ( action ) {
				case 'activate':
					return sprintf(
						// translators: %s is the plugin name.
						__( 'Activated %s' ),
						pluginName
					);
				case 'deactivate':
					return sprintf(
						// translators: %s is the plugin name.
						__( 'Deactivated %s' ),
						pluginName
					);
				case 'update':
					return sprintf(
						// translators: %s is the plugin name.
						__( 'Updated %s' ),
						pluginName
					);
				case 'enable-autoupdate':
					return sprintf(
						// translators: %s is the plugin name.
						__( 'Enabled auto‑updates for %s' ),
						pluginName
					);
				case 'disable-autoupdate':
					return sprintf(
						// translators: %s is the plugin name.
						__( 'Disabled auto‑updates for %s' ),
						pluginName
					);
				case 'delete':
					return sprintf(
						// translators: %s is the plugin name.
						__( 'Deleted %s' ),
						pluginName
					);
				default:
					return __( 'Action completed' );
			}
		}
		switch ( action ) {
			case 'activate':
				return sprintf(
					// translators: %d is the number of plugins activated.
					_n( 'Activated %d plugin', 'Activated %d plugins', selected.length, 'next-admin' ),
					selected.length
				);
			case 'deactivate':
				return sprintf(
					// translators: %d is the number of plugins deactivated.
					_n( 'Deactivated %d plugin', 'Deactivated %d plugins', selected.length, 'next-admin' ),
					selected.length
				);
			case 'update':
				return sprintf(
					// translators: %d is the number of plugins updated.
					_n( 'Updated %d plugin', 'Updated %d plugins', selected.length, 'next-admin' ),
					selected.length
				);
			case 'enable-autoupdate':
				return sprintf(
					// translators: %d is the number of plugins for which auto-updates were enabled.
					_n(
						'Enabled auto‑updates for %d plugin',
						'Enabled auto‑updates for %d plugins',
						selected.length,
						'next-admin'
					),
					selected.length
				);
			case 'disable-autoupdate':
				return sprintf(
					// translators: %d is the number of plugins for which auto-updates were disabled.
					_n(
						'Disabled auto‑updates for %d plugin',
						'Disabled auto‑updates for %d plugins',
						selected.length,
						'next-admin'
					),
					selected.length
				);
			case 'delete':
				return sprintf(
					// translators: %d is the number of plugins deleted.
					_n( 'Deleted %d plugin', 'Deleted %d plugins', selected.length, 'next-admin' ),
					selected.length
				);
			default:
				return __( 'Action completed' );
		}
	};

	const buildErrorPrefix = ( action: string, selected: PluginListRow[] ) => {
		if ( selected.length === 1 ) {
			const pluginName = selected[ 0 ].name;
			switch ( action ) {
				case 'activate':
					return sprintf(
						// translators: %s is the plugin name.
						__( 'Failed to activate %s' ),
						pluginName
					);
				case 'deactivate':
					return sprintf(
						// translators: %s is the plugin name.
						__( 'Failed to deactivate %s' ),
						pluginName
					);
				case 'update':
					return sprintf(
						// translators: %s is the plugin name.
						__( 'Failed to update %s' ),
						pluginName
					);
				case 'enable-autoupdate':
					return sprintf(
						// translators: %s is the plugin name.
						__( 'Failed to enable auto‑updates for %s' ),
						pluginName
					);
				case 'disable-autoupdate':
					return sprintf(
						// translators: %s is the plugin name.
						__( 'Failed to disable auto‑updates for %s' ),
						pluginName
					);
				case 'delete':
					return sprintf(
						// translators: %s is the plugin name.
						__( 'Failed to delete %s' ),
						pluginName
					);
				default:
					return __( 'Action failed' );
			}
		}
		switch ( action ) {
			case 'activate':
				return sprintf(
					// translators: %d is the number of plugins that failed to activate.
					_n(
						'Failed to activate %d plugin',
						'Failed to activate %d plugins',
						selected.length,
						'next-admin'
					),
					selected.length
				);
			case 'deactivate':
				return sprintf(
					// translators: %d is the number of plugins that failed to deactivate.
					_n(
						'Failed to deactivate %d plugin',
						'Failed to deactivate %d plugins',
						selected.length,
						'next-admin'
					),
					selected.length
				);
			case 'update':
				return sprintf(
					// translators: %d is the number of plugins that failed to update.
					_n(
						'Failed to update %d plugin',
						'Failed to update %d plugins',
						selected.length,
						'next-admin'
					),
					selected.length
				);
			case 'enable-autoupdate':
				return sprintf(
					// translators: %d is the number of plugins that failed to enable auto-updates.
					_n(
						'Failed to enable auto‑updates for %d plugin',
						'Failed to enable auto‑updates for %d plugins',
						selected.length,
						'next-admin'
					),
					selected.length
				);
			case 'disable-autoupdate':
				return sprintf(
					// translators: %d is the number of plugins that failed to disable auto-updates.
					_n(
						'Failed to disable auto‑updates for %d plugin',
						'Failed to disable auto‑updates for %d plugins',
						selected.length,
						'next-admin'
					),
					selected.length
				);
			case 'delete':
				return sprintf(
					// translators: %d is the number of plugins that failed to delete.
					_n(
						'Failed to delete %d plugin',
						'Failed to delete %d plugins',
						selected.length,
						'next-admin'
					),
					selected.length
				);
			default:
				return __( 'Action failed' );
		}
	};

	const handleConfirm = async () => {
		recordTracksEvent( `calypso_hosting_dashboard_plugins_${ actionId }_confirm_click` );
		setIsBusy( true );
		try {
			const { successCount, errorCount } = await onExecute( items );
			if ( successCount > 0 ) {
				const prefix = buildSuccessPrefix( actionId, items );
				createSuccessNotice(
					sprintf(
						// translators: %d is the number of sites.
						_n( '%1$s on %2$d site', '%1$s on %2$d sites', successCount, 'next-admin' ),
						prefix,
						successCount
					),
					{
						type: 'snackbar',
					}
				);
			}
			if ( errorCount > 0 ) {
				const errorPrefix = buildErrorPrefix( actionId, items );
				createErrorNotice(
					sprintf(
						// translators: %d is the number of sites.
						_n( '%1$s on %2$d site', '%1$s on %2$d sites', errorCount, 'next-admin' ),
						errorPrefix,
						errorCount
					),
					{
						type: 'snackbar',
					}
				);
			}
			onActionPerformed?.( items );
		} finally {
			setIsBusy( false );
			closeModal?.();
		}
	};

	return (
		<VStack spacing={ 4 }>
			<Text>{ getConfirmText( actionId, items ) }</Text>
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
