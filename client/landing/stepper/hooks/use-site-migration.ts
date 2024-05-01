import { FetchStatus } from '@tanstack/react-query';
import { usePluginAutoInstallation } from './use-plugin-auto-installation';
import { useSiteMigrationKey } from './use-site-migration-key';
import { useSiteTransfer } from './use-site-transfer';

const PLUGIN = { name: 'migrate-guru/migrateguru', slug: 'migrate-guru' };

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

/**
 *  Hook to manage the site migration flow, including site transfer, plugin installation and migration key retrieval
 */
export const useSiteMigration = ( siteId?: number ) => {
	const siteTransferState = useSiteTransfer( siteId );
	const pluginInstallationState = usePluginAutoInstallation( PLUGIN, siteId, {
		enabled: Boolean( siteTransferState.completed ),
	} );

	const {
		data: { migrationKey } = {},
		error: migrationKeyError,
		fetchStatus: migrationKeyFetchStatus,
	} = useSiteMigrationKey( siteId, {
		enabled: Boolean( pluginInstallationState.completed ),
	} );

	const completed = siteTransferState.completed && pluginInstallationState.completed;
	const error = siteTransferState.error || pluginInstallationState.error || migrationKeyError;

	const detailedStatus = {
		siteTransfer: siteTransferState.status,
		pluginInstallation: pluginInstallationState.status,
		migrationKey: ! pluginInstallationState.completed
			? 'idle'
			: getMigrationKeyStatus( migrationKey, migrationKeyFetchStatus, migrationKeyError ),
	};

	return {
		detailedStatus,
		completed,
		error,
		migrationKey: migrationKey ?? null,
	};
};
