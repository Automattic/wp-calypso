import config from '@automattic/calypso-config';
import { AppState } from 'calypso/types';
import { PreflightTestStatus } from './types';

// Selector to get the preflight overall status
export const getPreflightStatus = ( state: AppState, siteId: number ) => {
	// If the preflight check is disabled, return FAILED
	if ( ! config.isEnabled( 'jetpack/backup-restore-preflight-checks' ) ) {
		return PreflightTestStatus.FAILED;
	}

	return state.rewind[ siteId ]?.preflight.overallStatus || PreflightTestStatus.PENDING;
};
