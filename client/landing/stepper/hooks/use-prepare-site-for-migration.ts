import config from '@automattic/calypso-config';
import { useEffect } from 'react';
import { logToLogstash } from 'calypso/lib/logstash';
import { usePluginAutoInstallation } from './use-plugin-auto-installation';
import { useSiteMigrationKey } from './use-site-migration-key';
import { useSiteTransfer } from './use-site-transfer';

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
	siteId?: number,
	from?: string,
	options: Options = {}
) => {
	const plugin = { name: 'wpcom-migration/wpcom_migration', slug: 'wpcom-migration' };

	const siteTransferState = useSiteTransfer( siteId, {
		retry: options.retry ?? 0,
		from,
	} );

	const pluginInstallationState = usePluginAutoInstallation( plugin, siteId, {
		enabled: Boolean( siteTransferState.completed ),
	} );

	const {
		data: { migrationKey } = {},
		error: migrationKeyError,
		status: migrationKeyStatus,
	} = useSiteMigrationKey( siteId, {
		enabled: Boolean( pluginInstallationState.completed ),
		retry: options.retry ?? 0,
	} );

	const completed = siteTransferState.completed && pluginInstallationState.completed;
	const error = siteTransferState.error || pluginInstallationState.error || migrationKeyError;
	const criticalError = siteTransferState.error || pluginInstallationState.error;

	const detailedStatus = {
		siteTransfer: siteTransferState.status,
		pluginInstallation: pluginInstallationState.status,
		migrationKey: ! pluginInstallationState.completed ? 'idle' : migrationKeyStatus,
	};

	useLogMigration( completed, siteTransferState.status, criticalError, siteId );

	return {
		detailedStatus,
		completed,
		error,
		migrationKey: migrationKey ?? null,
	};
};
