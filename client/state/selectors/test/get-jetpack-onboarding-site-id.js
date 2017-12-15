/**
 * Internal dependencies
 */
import { getJetpackOnboardingSiteId } from 'state/selectors';

describe( '#getJetpackOnboardingSiteId()', () => {
	test( 'should return null if no site is in the Jetpack Onboarding flow', () => {
		const selected = getJetpackOnboardingSiteId( {
			ui: {
				jetpackOnboardingSiteId: null,
			},
		} );

		expect( selected ).toBeNull();
	} );

	test( 'should return ID for the site currently in the Jetpack Onboading flow', () => {
		const selected = getJetpackOnboardingSiteId( {
			ui: {
				jetpackOnboardingSiteId: 2916284,
			},
		} );

		expect( selected ).toBe( 2916284 );
	} );
} );
