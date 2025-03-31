import config from '@automattic/calypso-config';
import { useEffect } from 'react';
import { logToLogstash } from 'calypso/lib/logstash';
import { useRequestTransferWithSoftware } from 'calypso/sites/hooks/use-transfer-with-software-start-mutation';
import { useTransferWithSoftwareStatus } from 'calypso/sites/hooks/use-transfer-with-software-status-query';
import { useSiteMigrationKey } from './use-site-migration-key';

type Status = 'idle' | 'pending' | 'success' | 'error';

const safeLogToLogstash = ( message: string, properties: Record< string, unknown > ) => {
	try {
		logToLogstash( {
			feature: 'calypso_client',
			message,
			properties: {
				env: config( 'env_id' ),
				type: 'calypso_prepare_site_for_migration',
				...properties,
			},
		} );
	} catch ( e ) {
		// eslint-disable-next-line no-console
		console.error( e );
	}
};

const useLogMigration = (
	completed: boolean,
	siteTransferStatus: Status,
	error?: Error | null,
	siteId?: number
) => {
	useEffect( () => {
		if ( siteTransferStatus === 'pending' ) {
			return safeLogToLogstash( 'Site migration preparation started', {
				status: 'started',
				site_id: siteId,
			} );
		}
	}, [ siteTransferStatus, siteId ] );

	useEffect( () => {
		if ( error ) {
			return safeLogToLogstash( 'Site migration preparation failed', {
				status: 'error',
				error: error.message,
				error_type: error.name,
				site_id: siteId,
			} );
		}
	}, [ error, siteId ] );

	useEffect( () => {
		if ( completed ) {
			return safeLogToLogstash( 'Site migration preparation completed', {
				status: 'success',
				site_id: siteId,
			} );
		}
	}, [ completed, siteId ] );
};

type Options = {
	retry?: number;
};

/**
 *  Hook to manage the site to prepare a site for migration.
 *  This hook manages the site transfer, plugin installation and migration key fetching.
 */
export const usePrepareSiteForMigration = (
	siteId: number,
	from?: string,
	options: Options = {}
) => {
	const transferMutation = useRequestTransferWithSoftware( {
		siteId,
		apiSettings: {
			migration_source_site_domain: from,
		},
		plugins: [ 'wpcom-migration', 'activate' ],
	} );

	// Trigger the mutation when the hook is first used
	useEffect( () => {
		transferMutation.mutate();
	}, [ siteId, from ] ); // Dependencies that should trigger a new transfer

	const softwareTransferState = useTransferWithSoftwareStatus(
		siteId,
		transferMutation.data?.atomic_transfer_id ?? 0,
		{
			retry: options.retry ?? 0,
		}
	);

	const softwareTransferCompleted =
		'completed' === softwareTransferState.data?.atomic_transfer_status;

	const {
		data: { migrationKey } = {},
		error: migrationKeyError,
		status: migrationKeyStatus,
	} = useSiteMigrationKey( siteId, {
		enabled: Boolean( softwareTransferCompleted ),
		retry: options.retry ?? 0,
	} );

	const error = softwareTransferState.error || migrationKeyError;
	const criticalError = softwareTransferState.error;

	const detailedStatus = {
		siteTransferStatus: softwareTransferState.data?.atomic_transfer_status ?? 'idle',
		migrationKeyStatus: ! softwareTransferCompleted ? 'idle' : migrationKeyStatus,
	};

	useLogMigration( softwareTransferCompleted, softwareTransferState.status, criticalError, siteId );

	return {
		detailedStatus,
		softwareTransferCompleted,
		error,
		migrationKey: migrationKey ?? null,
	};
};
