/** @format */

/**
 * Internal dependencies
 */
import { JETPACK_ONBOARDING_STEPS as STEPS } from 'jetpack-onboarding/constants';
import { getJetpackOnboardingPendingSteps } from 'state/selectors';
import { getRequestKey } from 'state/data-layer/wpcom-http/utils';
import { saveJetpackSettings } from 'state/jetpack/settings/actions';

describe( 'getJetpackOnboardingPendingSteps()', () => {
	test( 'should return pending status for the contact form step', () => {
		const siteId = 2916284;
		const action = saveJetpackSettings( siteId, {
			onboarding: {
				addContactForm: true,
			},
		} );
		const state = {
			dataRequests: {
				[ getRequestKey( action ) ]: {
					status: 'pending',
				},
			},
		};

		const steps = [
			STEPS.SITE_TITLE,
			STEPS.SITE_TYPE,
			STEPS.CONTACT_FORM,
			STEPS.WOOCOMMERCE,
			STEPS.STATS,
		];
		const expected = {
			[ STEPS.SITE_TITLE ]: false,
			[ STEPS.SITE_TYPE ]: false,
			[ STEPS.CONTACT_FORM ]: true,
			[ STEPS.WOOCOMMERCE ]: false,
			[ STEPS.STATS ]: false,
		};
		const pending = getJetpackOnboardingPendingSteps( state, siteId, steps );
		expect( pending ).toEqual( expected );
	} );

	test( 'should return pending status for the woocommerce step', () => {
		const siteId = 2916284;
		const action = saveJetpackSettings( siteId, {
			onboarding: {
				installWooCommerce: true,
			},
		} );
		const state = {
			dataRequests: {
				[ getRequestKey( action ) ]: {
					status: 'pending',
				},
			},
		};

		const steps = [
			STEPS.SITE_TITLE,
			STEPS.SITE_TYPE,
			STEPS.CONTACT_FORM,
			STEPS.WOOCOMMERCE,
			STEPS.STATS,
		];
		const expected = {
			[ STEPS.SITE_TITLE ]: false,
			[ STEPS.SITE_TYPE ]: false,
			[ STEPS.CONTACT_FORM ]: false,
			[ STEPS.WOOCOMMERCE ]: true,
			[ STEPS.STATS ]: false,
		};
		const pending = getJetpackOnboardingPendingSteps( state, siteId, steps );
		expect( pending ).toEqual( expected );
	} );

	test( 'should return pending status for the stats step', () => {
		const siteId = 2916284;
		const action = saveJetpackSettings( siteId, {
			onboarding: {
				stats: true,
			},
		} );
		const state = {
			dataRequests: {
				[ getRequestKey( action ) ]: {
					status: 'pending',
				},
			},
		};

		const steps = [
			STEPS.SITE_TITLE,
			STEPS.SITE_TYPE,
			STEPS.CONTACT_FORM,
			STEPS.WOOCOMMERCE,
			STEPS.STATS,
		];
		const expected = {
			[ STEPS.SITE_TITLE ]: false,
			[ STEPS.SITE_TYPE ]: false,
			[ STEPS.CONTACT_FORM ]: false,
			[ STEPS.WOOCOMMERCE ]: false,
			[ STEPS.STATS ]: true,
		};
		const pending = getJetpackOnboardingPendingSteps( state, siteId, steps );
		expect( pending ).toEqual( expected );
	} );
} );
