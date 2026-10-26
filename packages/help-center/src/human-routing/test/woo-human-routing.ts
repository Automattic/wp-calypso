import { getWooHumanSupportRoute, WOO_HUMAN_ROUTING_ROWS } from '../woo-human-routing';
import type {
	HumanRoutingCustomer,
	HumanRoutingInput,
	HumanRoutingProduct,
	HumanSupportRouteType,
} from '../types';

const tier2Customer: HumanRoutingCustomer = {
	supportTier: 'tier_2',
	isPaying: false,
	isTargetCustomer: false,
	isWooEnterpriseCustomer: false,
};

const wooProduct: HumanRoutingProduct = {
	slug: 'woocommerce-subscriptions',
	supportType: 'woo',
	isRevShare: false,
	isCore: false,
	isPaymentExtension: false,
};

const coreProduct: HumanRoutingProduct = { ...wooProduct, slug: 'wc-core', isCore: true };

const input = ( overrides: Partial< HumanRoutingInput > = {} ): HumanRoutingInput => ( {
	flags: { isEmergency: false, emergencyType: null, routeToEmail: false },
	customer: tier2Customer,
	question: 'technical-support',
	product: wooProduct,
	...overrides,
} );

const customer = ( overrides: Partial< HumanRoutingCustomer > ) => ( {
	...tier2Customer,
	...overrides,
} );

const product = ( overrides: Partial< HumanRoutingProduct > ) => ( {
	...wooProduct,
	...overrides,
} );

const emergency = { isEmergency: true, emergencyType: 'checkout_broken', routeToEmail: false };

describe( 'getWooHumanSupportRoute', () => {
	it.each< [ string, HumanRoutingInput, number, HumanSupportRouteType ] >( [
		[
			'account recovery or unknown charge',
			input( { flags: { isEmergency: true, emergencyType: null, routeToEmail: true } } ),
			1,
			'email-form',
		],
		[
			'emergency, paying',
			input( { flags: emergency, customer: customer( { isPaying: true } ) } ),
			2,
			'chat',
		],
		[ 'emergency, not paying', input( { flags: emergency } ), 3, 'ticket' ],
		[ 'tier unknown', input( { customer: null } ), 4, 'ticket' ],
		[
			'third-party product',
			input( { product: product( { supportType: 'third_party' } ) } ),
			5,
			'vendor-ticket',
		],
		[
			'externally supported product',
			input( { product: product( { supportType: 'external' } ) } ),
			6,
			'link-out',
		],
		[
			'Woo Enterprise',
			input( { customer: customer( { supportTier: 'tier_1', isWooEnterpriseCustomer: true } ) } ),
			7,
			'ticket',
		],
		[
			'Tier 1, Core',
			input( { customer: customer( { supportTier: 'tier_1' } ), product: coreProduct } ),
			8,
			'ticket',
		],
		[
			'Tier 1, anything else',
			input( { customer: customer( { supportTier: 'tier_1' } ), question: 'start-scale-store' } ),
			9,
			'chat',
		],
		[ 'Tier 2, Woo product', input(), 10, 'chat' ],
		[ 'Tier 3, account', input( { question: 'account', product: null } ), 10, 'chat' ],
		[ 'Tier 2, Core', input( { product: coreProduct } ), 11, 'ai-reply-then-forums' ],
		[
			'paying, anything else',
			input( {
				customer: customer( { isPaying: true } ),
				question: 'start-scale-store',
				product: null,
			} ),
			12,
			'ticket',
		],
		[
			'not paying, pre-sales',
			input( { question: 'pre-sales', product: null } ),
			13,
			'email-form',
		],
		[
			'not paying, anything else',
			input( { question: 'start-scale-store', product: null } ),
			14,
			'forums',
		],
	] )( 'routes %s', ( _name, routingInput, rowId, route ) => {
		expect( getWooHumanSupportRoute( routingInput ) ).toEqual( { route, rowId } );
	} );

	it( 'routes a Woo payment extension for a not-paying Tier 3 merchant to chat', () => {
		// As written, row 10 (Woo product) matches before row 13 (payment extension), and
		// third-party or external payment extensions match rows 5 and 6. Asked on WOOPUBR-2400.
		expect(
			getWooHumanSupportRoute(
				input( {
					customer: customer( { supportTier: 'tier_3' } ),
					product: product( { slug: 'woocommerce-payments', isPaymentExtension: true } ),
				} )
			)
		).toEqual( { route: 'chat', rowId: 10 } );
	} );

	describe( 'row order', () => {
		it( 'puts emergencies before the product rows', () => {
			expect(
				getWooHumanSupportRoute(
					input( { flags: emergency, product: product( { supportType: 'third_party' } ) } )
				)
			).toEqual( { route: 'ticket', rowId: 3 } );
		} );

		it( 'puts emergencies before an unknown tier', () => {
			expect( getWooHumanSupportRoute( input( { flags: emergency, customer: null } ) ) ).toEqual( {
				route: 'ticket',
				rowId: 3,
			} );
		} );

		it( 'puts the vendor before Tier 1', () => {
			expect(
				getWooHumanSupportRoute(
					input( {
						customer: customer( { supportTier: 'tier_1' } ),
						product: product( { supportType: 'third_party' } ),
					} )
				)
			).toEqual( { route: 'vendor-ticket', rowId: 5 } );
		} );
	} );

	describe( 'derived facts', () => {
		it( 'counts a rev-share product as paying', () => {
			expect(
				getWooHumanSupportRoute(
					input( { flags: emergency, product: product( { isRevShare: true } ) } )
				)
			).toEqual( { route: 'chat', rowId: 2 } );
		} );

		it( 'treats a target customer as Tier 1', () => {
			expect(
				getWooHumanSupportRoute(
					input( { customer: customer( { isTargetCustomer: true } ), product: coreProduct } )
				)
			).toEqual( { route: 'ticket', rowId: 8 } );
		} );

		it( "doesn't count Core as a Woo product", () => {
			expect( getWooHumanSupportRoute( input( { product: coreProduct } ) ).rowId ).toBe( 11 );
		} );
	} );

	describe( 'the table', () => {
		it( 'has unique row ids', () => {
			const ids = WOO_HUMAN_ROUTING_ROWS.map( ( { id } ) => id );
			expect( new Set( ids ).size ).toBe( ids.length );
		} );

		it( 'ends with a row that matches everything', () => {
			expect( WOO_HUMAN_ROUTING_ROWS.at( -1 )?.when( {} as never ) ).toBe( true );
		} );
	} );
} );
