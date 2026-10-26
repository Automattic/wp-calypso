import {
	getWooRoutingInput,
	isProductAsked,
	isProductRequired,
	isStoreAsked,
	isStoreRequired,
	WOO_CORE_PRODUCT_SLUG,
} from '../woo-handoff';
import type { WooHandoffData, WooHandoffProduct } from '../woo-handoff';

const subscriptions: WooHandoffProduct = {
	slug: 'woocommerce-subscriptions',
	name: 'WooCommerce Subscriptions',
	supportType: 'woo',
	isRevShare: false,
};

const core: WooHandoffProduct = {
	slug: WOO_CORE_PRODUCT_SLUG,
	name: 'WooCommerce',
	supportType: 'woo',
	isRevShare: false,
};

const external: WooHandoffProduct = {
	slug: 'stripe-tax',
	name: 'Stripe Tax',
	supportType: 'external',
	isRevShare: false,
	externalSupportUrl: 'https://example.com/support',
};

const data: WooHandoffData = {
	supportTier: 'tier_2',
	isPaying: true,
	isTargetCustomer: false,
	isWooEnterpriseCustomer: false,
	connectedStores: [ { url: 'https://store.example', domain: 'store.example' } ],
	supportedProducts: [ subscriptions, core, external ],
	isVendor: false,
};

const flags = { isEmergency: false, emergencyType: null, routeToEmail: false };

describe( 'getWooRoutingInput', () => {
	it( 'maps the merchant and the chosen product', () => {
		expect(
			getWooRoutingInput( {
				data,
				flags,
				answers: {
					question: 'technical-support',
					productSlug: 'woocommerce-subscriptions',
					storeUrl: 'https://store.example',
				},
			} )
		).toEqual( {
			flags,
			question: 'technical-support',
			customer: {
				supportTier: 'tier_2',
				isPaying: true,
				isTargetCustomer: false,
				isWooEnterpriseCustomer: false,
			},
			product: {
				slug: 'woocommerce-subscriptions',
				supportType: 'woo',
				isRevShare: false,
				isCore: false,
				isPaymentExtension: false,
			},
		} );
	} );

	it( 'marks WooCommerce Core', () => {
		const input = getWooRoutingInput( {
			data,
			flags,
			answers: {
				question: 'technical-support',
				productSlug: WOO_CORE_PRODUCT_SLUG,
				storeUrl: null,
			},
		} );

		expect( input.product?.isCore ).toBe( true );
	} );

	it( 'leaves the tier unknown without merchant data or a tier', () => {
		const answers = { question: 'account' as const, productSlug: null, storeUrl: null };

		expect( getWooRoutingInput( { data: null, flags, answers } ).customer ).toBeNull();
		expect(
			getWooRoutingInput( { data: { ...data, supportTier: null }, flags, answers } ).customer
		).toBeNull();
	} );

	it( 'has no product when none was picked or it is not in the list', () => {
		const input = ( productSlug: string | null ) =>
			getWooRoutingInput( {
				data,
				flags,
				answers: { question: 'pre-sales', productSlug, storeUrl: null },
			} );

		expect( input( null ).product ).toBeNull();
		expect( input( 'unknown-product' ).product ).toBeNull();
	} );
} );

describe( 'which questions are asked', () => {
	it( 'asks for a product for technical support and pre-sales', () => {
		expect( isProductAsked( 'technical-support' ) ).toBe( true );
		expect( isProductAsked( 'pre-sales' ) ).toBe( true );
		expect( isProductAsked( 'account' ) ).toBe( false );
		expect( isProductRequired( 'technical-support' ) ).toBe( true );
		expect( isProductRequired( 'pre-sales' ) ).toBe( false );
	} );

	it( 'asks for a store unless the product is supported externally', () => {
		expect( isStoreAsked( 'technical-support', subscriptions ) ).toBe( true );
		expect( isStoreAsked( 'technical-support', null ) ).toBe( true );
		expect( isStoreAsked( 'technical-support', external ) ).toBe( false );
		expect( isStoreAsked( 'start-scale-store', null ) ).toBe( false );
		expect( isStoreRequired( 'technical-support' ) ).toBe( true );
		expect( isStoreRequired( 'pre-sales' ) ).toBe( false );
	} );
} );
