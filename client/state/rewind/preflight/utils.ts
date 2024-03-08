import { PreflightTest, PreflightTestStatus } from './types';

/**
 * Calculates the overall preflight status based on individual test statuses.
 *
 * The logic for determining the overall status is as follows:
 * - If any test has failed, the overall status is set to FAILED.
 * - If no tests have failed but at least one is in progress, the overall status is IN_PROGRESS.
 * - If all tests are successful, the overall status is SUCCESS.
 * - If none of the above conditions are met, the overall status defaults to PENDING.
 * @param tests An array of PreflightTest objects.
 * @returns The overall status as a PreflightTestStatus enum value.
 */
export const calculateOverallStatus = ( tests: PreflightTest[] ): PreflightTestStatus => {
	// If there are no tests, the overall status is PENDING.
	if ( tests.length === 0 ) {
		return PreflightTestStatus.PENDING;
	}

	if ( tests.some( ( test ) => test.status === PreflightTestStatus.FAILED ) ) {
		return PreflightTestStatus.FAILED;
	} else if ( tests.some( ( test ) => test.status === PreflightTestStatus.IN_PROGRESS ) ) {
		return PreflightTestStatus.IN_PROGRESS;
	} else if ( tests.every( ( test ) => test.status === PreflightTestStatus.SUCCESS ) ) {
		return PreflightTestStatus.SUCCESS;
	}
	return PreflightTestStatus.PENDING;
};
