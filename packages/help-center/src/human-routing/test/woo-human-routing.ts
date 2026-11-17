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
		[ 'not paying, Woo product', input(), 15, 'forums' ],
		[
			'Tier 2, paying, Woo product',
			input( { customer: customer( { isPaying: true } ) } ),
			10,
			'chat',
		],
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
		[ 'not paying, pre-sales', input( { question: 'pre-sales', product: null } ), 13, 'ticket' ],
		[
			'not paying, start or scale a store',
			input( { question: 'start-scale-store', product: null } ),
			13,
			'ticket',
		],
		[
			'not paying, Marketplace vendors',
			input( { question: 'marketplace-vendor', product: null } ),
			13,
			'ticket',
		],
		[ 'not paying, anything else', input( { product: null } ), 14, 'forums' ],
	] )( 'routes %s', ( _name, routingInput, rowId, route ) => {
		expect( getWooHumanSupportRoute( routingInput ) ).toEqual( { route, rowId } );
	} );

	it( 'routes a rev-share payment extension for a not-paying Tier 3 merchant to chat', () => {
		expect(
			getWooHumanSupportRoute(
				input( {
					customer: customer( { supportTier: 'tier_3' } ),
					product: product( { slug: 'woocommerce-paypal-payments', isRevShare: true } ),
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

		it( "routes a merchant without data like a Tier 2 or 3 merchant who isn't paying", () => {
			expect( getWooHumanSupportRoute( input( { customer: null } ) ) ).toEqual( {
				route: 'forums',
				rowId: 15,
			} );
			expect(
				getWooHumanSupportRoute( input( { customer: null, question: 'account', product: null } ) )
			).toEqual( { route: 'chat', rowId: 10 } );
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
