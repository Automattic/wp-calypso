/** @format */

/**
 * Internal dependencies
 */
import { JETPACK_ONBOARDING_STEPS as STEPS } from 'jetpack-onboarding/constants';
import { getJetpackOnboardingPending } from 'state/selectors';
import { getRequestKey } from 'state/data-layer/wpcom-http/utils';
import { saveJetpackOnboardingSettings } from 'state/jetpack-onboarding/actions';

describe( 'getJetpackOnboardingPending()', () => {
	test( 'should return pending status for the specified steps', () => {
		const siteId = 2916284;
		const action = saveJetpackOnboardingSettings( siteId, { installWooCommerce: true } );
		const state = {
			dataRequests: {
				[ getRequestKey( action ) ]: {
					status: 'pending',
				},
			},
		};

		const steps = [ STEPS.SITE_TITLE, STEPS.SITE_TYPE, STEPS.WOOCOMMERCE ];
		const expected = {
			[ STEPS.SITE_TITLE ]: false,
			[ STEPS.SITE_TYPE ]: false,
			[ STEPS.WOOCOMMERCE ]: true,
		};
		const pending = getJetpackOnboardingPending( state, siteId, steps );
		expect( pending ).toEqual( expected );
	} );
} );
