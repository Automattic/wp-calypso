/**
 * External dependencies
 */
import { isArray } from 'lodash';

/**
 * Internal dependencies
 */
import { AppState } from 'calypso/types';
import getRewindCapabilities from 'calypso/state/selectors/get-rewind-capabilities';

const siteHasRealtimeBackups = ( state: AppState, siteId: number ): boolean => {
	const capabilities = getRewindCapabilities( state, siteId );
	return isArray( capabilities ) && capabilities.includes( 'backup-realtime' );
};

export default siteHasRealtimeBackups;
