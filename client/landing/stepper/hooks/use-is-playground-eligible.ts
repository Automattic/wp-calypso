import config from '@automattic/calypso-config';

export function useIsPlaygroundEligible() {
	return config.isEnabled( 'onboarding/playground' );
}
