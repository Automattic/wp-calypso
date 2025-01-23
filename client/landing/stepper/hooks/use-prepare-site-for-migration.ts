import config from '@automattic/calypso-config';
import { FetchStatus } from '@tanstack/react-query';
import { useEffect } from 'react';
import { logToLogstash } from 'calypso/lib/logstash';
import { useSiteMigrationKey } from './use-site-migration-key';
import { useSiteTransfer } from './use-site-transfer';

type Status = 'idle' | 'pending' | 'success' | 'error';

const getMigrationKeyStatus = (
	migrationKey: string | null | undefined,
	status: FetchStatus,
	error: Error | null
): Status => {
	if ( migrationKey ) {
		return 'success';
	}
	if ( status === 'fetching' ) {
		return 'pending';
	}

	if ( error ) {
		return 'error';
	}

	return status as Status;
};

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

/**
 *  Hook to manage the site to prepare a site for migration.
 *  This hook manages the site transfer, plugin installation and migration key fetching.
 */
export const usePrepareSiteForMigration = ( siteId?: number ) => {
	const siteTransferState = useSiteTransfer( siteId );

	const {
		data: { migrationKey } = {},
		error: migrationKeyError,
		fetchStatus: migrationKeyFetchStatus,
	} = useSiteMigrationKey( siteId, {
		enabled: Boolean( siteTransferState.completed ),
		retry: 3,
	} );

	const completed = siteTransferState.completed;
	const error = siteTransferState.error || migrationKeyError;
	const criticalError = siteTransferState.error;

	const detailedStatus = {
		siteTransfer: siteTransferState.status,
		migrationKey: ! siteTransferState.completed
			? 'idle'
			: getMigrationKeyStatus( migrationKey, migrationKeyFetchStatus, migrationKeyError ),
	};

	useLogMigration( completed, siteTransferState.status, criticalError, siteId );

	return {
		detailedStatus,
		completed,
		error,
		migrationKey: migrationKey ?? null,
	};
};
