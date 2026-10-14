import {
	siteWordPressMigrationConfigurationQuery,
	siteWordPressMigrationConfigureMutation,
	siteWordPressMigrationRunMutation,
} from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import { __experimentalVStack as VStack, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { withSnackbar } from '../../../app/snackbars/with-snackbar';
import ClipboardInputControl from '../../../components/clipboard-input-control';
import Notice from '../../../components/notice';
import { Text } from '../../../components/text';
import { MigrationCard } from './migration-card';
import type { Site } from '@automattic/api-core';

const MANUAL_INSTALL = 'manual-wpcom-install';

function useManualInstall( site: Site ) {
	const {
		data: configuration,
		isError,
		refetch,
	} = useQuery( siteWordPressMigrationConfigurationQuery( site.ID ) );
	const manualInstall = configuration?.available_source_connections.find(
		( { method } ) => method === MANUAL_INSTALL
	);
	return { manualInstall, isError, refetch };
}

function SourceKey( { site }: { site: Site } ) {
	const { manualInstall, isError, refetch } = useManualInstall( site );

	if ( isError ) {
		return (
			<Notice
				variant="error"
				actions={
					<Button variant="link" onClick={ () => refetch() }>
						{ __( 'Try again' ) }
					</Button>
				}
			>
				{ __( 'We couldn’t load your secret key.' ) }
			</Notice>
		);
	}

	return (
		<ClipboardInputControl
			label={ __( 'Secret key' ) }
			value={ manualInstall?.key ?? '' }
			readOnly
		/>
	);
}

export function Connect( { site }: { site: Site } ) {
	const snackbar = { error: __( 'Failed to start the migration.' ) };
	const { manualInstall } = useManualInstall( site );
	const configure = useMutation(
		withSnackbar( siteWordPressMigrationConfigureMutation( site.ID ), snackbar )
	);
	const run = useMutation( withSnackbar( siteWordPressMigrationRunMutation( site.ID ), snackbar ) );
	const isStarting = configure.isPending || run.isPending;

	const startMigration = () =>
		configure.mutate(
			{ source_connection: { method: MANUAL_INSTALL } },
			{ onSuccess: () => run.mutate( {} ) }
		);

	return (
		<MigrationCard
			title={ __( 'Install our plugin to start the migration' ) }
			actions={
				<>
					<Button
						__next40pxDefaultSize
						variant="primary"
						href={ manualInstall?.install_url }
						target="_blank"
						disabled={ ! manualInstall }
					>
						{ __( 'Install the plugin ↗' ) }
					</Button>
					<Button
						__next40pxDefaultSize
						variant="secondary"
						isBusy={ isStarting }
						disabled={ ! manualInstall || isStarting }
						onClick={ startMigration }
					>
						{ __( 'I’ve added the key, start the migration' ) }
					</Button>
				</>
			}
		>
			<VStack spacing={ 1 }>
				<Text variant="muted">
					{ __(
						'1. Install and activate the Migrate to WordPress.com plugin. Its page opens by itself.'
					) }
				</Text>
				<Text variant="muted">
					{ __(
						'2. On its page, choose “Can’t connect? Use a secret key instead” and paste this key:'
					) }
				</Text>
			</VStack>
			<SourceKey site={ site } />
		</MigrationCard>
	);
}
