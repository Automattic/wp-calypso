import { WOO_HOSTING_SOLUTIONS_REF } from 'calypso/landing/stepper/constants';

const ACCOUNT_STEP_PATH = /^\/setup\/onboarding\/user(\/|$)/;

/**
 * Whether `url` is the onboarding flow's account step, the page that assigns
 * calypso_account_step_entry_clarity_202609. Accepts the relative or absolute form the step
 * passes along as `signup_url`, with or without a trailing locale segment.
 *
 * Woo referrers are left out, matching the step, which does not assign them either.
 */
export default function isOnboardingAccountStepUrl( url: string | null | undefined ): boolean {
	if ( ! url ) {
		return false;
	}

	try {
		const { pathname, searchParams } = new URL( url, 'https://wordpress.com' );
		return (
			ACCOUNT_STEP_PATH.test( pathname ) && searchParams.get( 'ref' ) !== WOO_HOSTING_SOLUTIONS_REF
		);
	} catch {
		return false;
	}
}
