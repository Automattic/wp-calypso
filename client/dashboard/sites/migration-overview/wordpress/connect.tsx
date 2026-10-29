import {
	siteWordPressMigrationConfigureMutation,
	siteWordPressMigrationRunMutation,
} from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useState } from 'react';
import { withSnackbar } from '../../../app/snackbars/with-snackbar';
import ConfirmModal from '../../../components/confirm-modal';
import Notice from '../../../components/notice';
import { ConnectionHelp, MANUAL_INSTALL, useManualInstall } from './connection-help';
import { AssistedHandoffLink, MigrationCard, StatusIcon } from './migration-card';
import type { Site, WordPressMigrationFinding } from '@automattic/api-core';

export function Connect( {
	site,
	sourceHost,
	sourceConnected,
	failure,
	retryFindings,
	onRetry,
}: {
	site: Site;
	sourceHost: string;
	// Read with the migration, so it's more up to date than the configuration's.
	sourceConnected?: boolean;
	failure?: WordPressMigrationFinding;
	// Set once the source is connected after refusing: running again, accepting these, should get further.
	retryFindings?: string[];
	onRetry: () => void;
} ) {
	const snackbar = { error: __( 'Failed to start the migration.' ) };
	const { manualInstall, isError, refetch } = useManualInstall( site );
	const [ hasSeenKey, setHasSeenKey ] = useState( false );
	const [ isConfirming, setIsConfirming ] = useState( false );
	const configure = useMutation(
		withSnackbar( siteWordPressMigrationConfigureMutation( site.ID ), snackbar )
	);
	const run = useMutation( withSnackbar( siteWordPressMigrationRunMutation( site.ID ), snackbar ) );
	const isStarting = configure.isPending || run.isPending;
	const isSourceConnected = !! ( sourceConnected ?? manualInstall?.connected );
	const isConnected = failure ? !! retryFindings : isSourceConnected;

	const startMigration = () => {
		if ( retryFindings ) {
			run.mutate( { accept_findings: retryFindings }, { onSuccess: onRetry } );
			return;
		}
		configure.mutate(
			{ source_connection: { method: MANUAL_INSTALL } },
			{ onSuccess: () => run.mutate( {} ) }
		);
	};

	// A run can't reach a source that isn't connected, so check before starting one that will only be refused.
	const onStart = () => {
		if ( ! isSourceConnected && ! hasSeenKey ) {
			setIsConfirming( true );
			return;
		}
		startMigration();
	};

	return (
		<MigrationCard
			title={
				isConnected
					? sprintf(
							/* translators: %s: the domain of the site being migrated, e.g. example.com. */
							__( 'Ready to migrate %s' ),
							sourceHost
						)
					: __( 'Install our plugin to start the migration' )
			}
			decoration={ <StatusIcon status="pending" /> }
			actions={
				<>
					{ ! isConnected && (
						<Button
							__next40pxDefaultSize
							variant="primary"
							href={ manualInstall?.install_url }
							target="_blank"
							disabled={ ! manualInstall }
						>
							{ __( 'Install the plugin ↗' ) }
						</Button>
					) }
					<Button
						__next40pxDefaultSize
						variant={ isConnected ? 'primary' : 'secondary' }
						isBusy={ isStarting }
						disabled={ ! manualInstall || isStarting }
						onClick={ onStart }
					>
						{ __( 'Start the migration' ) }
					</Button>
				</>
			}
			secondaryAction={ <AssistedHandoffLink /> }
		>
			{ failure && ! isConnected && (
				<Notice variant="error" title={ failure.label }>
					{ failure.message }
				</Notice>
			) }
			{ isError && (
				<Notice
					variant="error"
					actions={
						<Button variant="link" onClick={ () => refetch() }>
							{ __( 'Try again' ) }
						</Button>
					}
				>
					{ __( 'We couldn’t load your site’s details.' ) }
				</Notice>
			) }
			{ isConnected && (
				<Notice variant="success" title={ __( 'Plugin installed and connected' ) }>
					{ __( 'Your site is connected to WordPress.com.' ) }
				</Notice>
			) }
			<ConnectionHelp
				manualInstall={ manualInstall }
				lastStep={ __( '3. Come back here and start the migration.' ) }
				onOpenFallbacks={ () => setHasSeenKey( true ) }
			/>
			<ConfirmModal
				__experimentalHideHeader={ false }
				title={ __( 'Start the migration anyway?' ) }
				icon={ <StatusIcon status="warning" /> }
				// The header's close button would repeat "Go back"; Escape still closes it.
				isDismissible={ false }
				isOpen={ isConfirming }
				cancelButtonText={ __( 'Go back' ) }
				confirmButtonProps={ { label: __( 'Start anyway' ) } }
				onCancel={ () => setIsConfirming( false ) }
				onConfirm={ () => {
					setIsConfirming( false );
					startMigration();
				} }
			>
				{ __(
					'Your site isn’t connected to WordPress.com, and you haven’t viewed or copied the migration key. The migration needs one of the two to reach your site, so it’s likely to stop right away.'
				) }
			</ConfirmModal>
		</MigrationCard>
	);
}
