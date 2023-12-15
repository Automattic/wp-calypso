import config from '@automattic/calypso-config';
import { AppState } from 'calypso/types';
import { PreflightTestStatus } from './types';

// Selector to get the preflight overall status
export const getPreflightStatus = ( state: AppState ) => {
	// If the preflight check is disabled, return FAILED
	if ( ! config.isEnabled( 'jetpack/backup-restore-preflight-check' ) ) {
		return PreflightTestStatus.FAILED;
	}

	return state.preflight.overallStatus;
};
