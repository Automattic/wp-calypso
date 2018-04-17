/** @format */

/**
 * Internal dependencies
 */
import { getJetpackOnboardingSettings } from 'state/selectors';

describe( '#getJetpackOnboardingSettings()', () => {
	const onboardingSettings = {
		siteTitle: 'My awesome site',
		siteDescription: 'Not just another amazing WordPress site',
	};
	const settings = {
		2916284: {
			onboarding: onboardingSettings,
		},
	};

	test( 'should return null if we have no settings at all', () => {
		const selected = getJetpackOnboardingSettings(
			{
				jetpack: {
					settings: {},
				},
			},
			12345678
		);

		expect( selected ).toBeNull();
	} );

	test( 'should return null if we have no settings for the current site ID', () => {
		const selected = getJetpackOnboardingSettings(
			{
				jetpack: {
					settings,
				},
			},
			12345678
		);

		expect( selected ).toBeNull();
	} );

	test( 'should return the site settings of a known unconnected site', () => {
		const selected = getJetpackOnboardingSettings(
			{
				jetpack: {
					settings,
				},
			},
			2916284
		);

		expect( selected ).toBe( onboardingSettings );
	} );
} );
