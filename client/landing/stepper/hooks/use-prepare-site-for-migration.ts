import config from '@automattic/calypso-config';
import { FetchStatus } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { logToLogstash } from 'calypso/lib/logstash';
import { usePluginAutoInstallation } from './use-plugin-auto-installation';
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

interface TransferState {
	completed: boolean;
	status: Status;
}

interface TimeTrackingResult {
	siteTransferStart: React.MutableRefObject< number >;
	siteTransferEnd: React.MutableRefObject< number >;
	pluginInstallationStart: React.MutableRefObject< number >;
	pluginInstallationEnd: React.MutableRefObject< number >;
}

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

const useTransferTimeTracking = (
	siteTransferState: TransferState,
	pluginInstallationState?: TransferState
): TimeTrackingResult => {
	const siteTransferStart = useRef( 0 );
	const siteTransferEnd = useRef( 0 );
	const pluginInstallationStart = useRef( 0 );
	const pluginInstallationEnd = useRef( 0 );

	// Time the Atomic transfer
	useEffect( () => {
		if (
			! siteTransferState.completed &&
			'pending' === siteTransferState.status &&
			siteTransferStart.current === 0
		) {
			siteTransferStart.current = Date.now();
		}
		if ( siteTransferState.completed && siteTransferEnd.current === 0 ) {
			siteTransferEnd.current = Date.now();
		}
	}, [ siteTransferState, siteTransferStart, siteTransferEnd ] );

	// Time the plugin installation
	useEffect( () => {
		if ( ! pluginInstallationState ) {
			return;
		}

		if (
			! pluginInstallationState.completed &&
			'pending' === pluginInstallationState.status &&
			pluginInstallationStart.current === 0
		) {
			pluginInstallationStart.current = Date.now();
		}
		if ( pluginInstallationState.completed && pluginInstallationEnd.current === 0 ) {
			pluginInstallationEnd.current = Date.now();
		}
	}, [ pluginInstallationState, pluginInstallationStart, pluginInstallationEnd ] );

	return { siteTransferStart, siteTransferEnd, pluginInstallationStart, pluginInstallationEnd };
};

/**
 *  Hook to manage the site to prepare a site for migration.
 *  This hook manages the site transfer, plugin installation and migration key fetching.
 */
export const usePrepareSiteForMigration = ( siteId?: number ) => {
	const plugin = { name: 'wpcom-migration/wpcom_migration', slug: 'wpcom-migration' };
	const siteTransferState = useSiteTransfer( siteId );
	const pluginInstallationState = usePluginAutoInstallation( plugin, siteId, {
		enabled: Boolean( siteTransferState.completed ),
	} );
	const transferTimingTracked = useRef( false );

	const {
		data: { migrationKey } = {},
		error: migrationKeyError,
		fetchStatus: migrationKeyFetchStatus,
	} = useSiteMigrationKey( siteId, {
		enabled: Boolean( pluginInstallationState.completed ),
		retry: false,
	} );

	const { siteTransferStart, siteTransferEnd, pluginInstallationStart, pluginInstallationEnd } =
		useTransferTimeTracking( siteTransferState, pluginInstallationState );

	const completed = siteTransferState.completed && pluginInstallationState.completed;
	const error = siteTransferState.error || pluginInstallationState.error || migrationKeyError;
	const criticalError = siteTransferState.error || pluginInstallationState.error;
	const hasAllTimingInfo = siteTransferEnd.current !== 0 && pluginInstallationEnd.current !== 0;

	if ( completed && hasAllTimingInfo && ! transferTimingTracked.current ) {
		const siteTransferElapsed = siteTransferEnd.current - siteTransferStart.current;
		const pluginInstallationElapsed =
			pluginInstallationEnd.current - pluginInstallationStart.current;

		recordTracksEvent( 'calypso_onboarding_site_migration_transfer_timing', {
			error,
			site_transfer_elapsed: siteTransferElapsed,
			plugin_installation_elapsed: pluginInstallationElapsed,
			migration_setup_elapsed: siteTransferElapsed + pluginInstallationElapsed,
		} );

		transferTimingTracked.current = true;
	}

	const detailedStatus = {
		siteTransfer: siteTransferState.status,
		pluginInstallation: pluginInstallationState.status,
		migrationKey: ! pluginInstallationState.completed
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
