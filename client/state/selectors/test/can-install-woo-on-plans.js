import {
	PLAN_FREE,
	PLAN_PREMIUM,
	PLAN_PERSONAL,
	PLAN_BUSINESS,
	PLAN_ECOMMERCE,
} from '@automattic/calypso-products';
import canInstallWooOnPlans from 'calypso/state/selectors/can-install-woo-on-plans';

describe( 'canInstallWooOnPlans', () => {
	test( 'free', () => {
		const state = {
			sites: {
				items: {
					1: { plan: { product_slug: PLAN_FREE } },
				},
			},
			currentUser: { capabilities: { 1: { manage_options: true } } },
		};
		expect( canInstallWooOnPlans( state, 1 ) ).toBe( false );
	} );

	test( 'personal', () => {
		const state = {
			sites: {
				items: {
					1: { plan: { product_slug: PLAN_PERSONAL } },
				},
			},
			currentUser: { capabilities: { 1: { manage_options: true } } },
		};
		expect( canInstallWooOnPlans( state, 1 ) ).toBe( false );
	} );

	test( 'premium', () => {
		const state = {
			sites: {
				items: {
					1: { plan: { product_slug: PLAN_PREMIUM } },
				},
			},
			currentUser: { capabilities: { 1: { manage_options: true } } },
		};
		expect( canInstallWooOnPlans( state, 1 ) ).toBe( false );
	} );

	test( 'business', () => {
		const state = {
			sites: {
				items: {
					1: { plan: { product_slug: PLAN_BUSINESS } },
				},
			},
			currentUser: { capabilities: { 1: { manage_options: true } } },
		};
		expect( canInstallWooOnPlans( state, 1 ) ).toBe( true );
	} );

	test( 'ecommerce', () => {
		const state = {
			sites: {
				items: {
					1: { plan: { product_slug: PLAN_ECOMMERCE } },
				},
			},
			currentUser: { capabilities: { 1: { manage_options: true } } },
		};
		expect( canInstallWooOnPlans( state, 1 ) ).toBe( true );
	} );

	test( 'requires capability manage_options', () => {
		const state = {
			sites: {
				items: {
					1: { plan: { product_slug: PLAN_BUSINESS } },
				},
			},
			currentUser: { capabilities: { 1: { manage_options: false } } },
		};
		expect( canInstallWooOnPlans( state, 1 ) ).toBe( false );
	} );
} );
