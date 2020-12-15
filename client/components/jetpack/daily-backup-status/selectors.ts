/**
 * External dependencies
 */
import { isArray } from 'lodash';

/**
 * Internal dependencies
 */
import { AppState } from 'calypso/types';
import getRewindBackups from 'calypso/state/selectors/get-rewind-backups';
import getRewindCapabilities from 'calypso/state/selectors/get-rewind-capabilities';

export const siteHasRealtimeBackups = ( state: AppState, siteId: number ): boolean => {
	const capabilities = getRewindCapabilities( state, siteId );
	return isArray( capabilities ) && capabilities.includes( 'backup-realtime' );
};

export const siteHasBackupInProgress = ( state: AppState, siteId: number ): boolean => {
	const recentBackups = getRewindBackups( state, siteId );
	return recentBackups?.length ? recentBackups[ 0 ].status === 'started' : false;
};
