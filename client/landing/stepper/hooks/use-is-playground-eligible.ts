import config from '@automattic/calypso-config';

export function useIsPlaygroundEligible() {
	return isPlaygroundEligible();
}

export function isPlaygroundEligible() {
	return config.isEnabled( 'onboarding/playground' );
}
