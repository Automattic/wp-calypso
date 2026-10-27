/**
 * Run with:
 * yarn test-client client/lib/signup/test/is-onboarding-account-step-url.ts
 */
import isOnboardingAccountStepUrl from '../is-onboarding-account-step-url';

describe( 'isOnboardingAccountStepUrl', () => {
	test.each( [
		[ 'the relative step path', '/setup/onboarding/user', true ],
		[ 'the step path with a query', '/setup/onboarding/user?from=example', true ],
		[ 'the step path with a locale segment', '/setup/onboarding/user/de', true ],
		[ 'the absolute step URL', 'https://wordpress.com/setup/onboarding/user?x=1', true ],
		[
			'a Woo referrer, which the step does not assign',
			'/setup/onboarding/user?ref=woo-hosting-solutions-flow',
			false,
		],
		[ 'another onboarding step', '/setup/onboarding/domains', false ],
		[ 'a step whose name only starts the same way', '/setup/onboarding/user-social', false ],
		[ 'the legacy signup flow', '/start', false ],
		[ 'a different stepper flow', '/setup/site-setup/user', false ],
		[ 'an empty string', '', false ],
		[ 'null', null, false ],
		[ 'undefined', undefined, false ],
		[ 'an unparsable value', 'http://[', false ],
	] )( 'handles %s', ( _label, url, expected ) => {
		expect( isOnboardingAccountStepUrl( url ) ).toBe( expected );
	} );
} );
