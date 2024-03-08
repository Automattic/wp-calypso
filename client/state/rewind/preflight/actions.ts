import { JETPACK_BACKUP_PREFLIGHT_TESTS_SET } from 'calypso/state/action-types';
import { PreflightTest } from './types';

export const updatePreflightTests = ( siteId: number, tests: PreflightTest[] ) => {
	return {
		type: JETPACK_BACKUP_PREFLIGHT_TESTS_SET,
		siteId,
		tests,
	};
};
