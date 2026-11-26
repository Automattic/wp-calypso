import { getWooTicketPlan } from '../woo-ticket';
import type { HumanRoutingFlags } from '../types';
import type { WooHandoffProduct, WooHandoffStore } from '../woo-handoff';
import type { Message } from '@automattic/odie-client';

const flags: HumanRoutingFlags = {
	isEmergency: false,
	emergencyType: null,
	routeToEmail: false,
	isUnknownCharge: false,
};

const message = ( role: Message[ 'role' ], content: string ): Message => ( {
	role,
	content,
	type: 'message',
} );

/** Messages loaded from the AI chat's history have no `type`. Only those sent from the page do. */
const historyMessage = ( role: Message[ 'role' ], content: string ) =>
	( { role, content } ) as Message;

const chat = {
	odieId: 7873852,
	messages: [
		{ role: 'bot', content: 'Howdy', type: 'introduction' } as Message,
		historyMessage( 'user', 'My checkout is broken' ),
		historyMessage( 'bot', 'Which store is this about?' ),
		message( 'user', 'The connected one.' ),
	],
};

const subscriptions: WooHandoffProduct = {
	slug: 'woocommerce-subscriptions',
	name: 'WooCommerce Subscriptions',
	supportType: 'woo',
	isRevShare: false,
};

const vendorProduct: WooHandoffProduct = {
	slug: 'vendor-extension',
	name: 'Vendor Extension',
	supportType: 'third_party',
	isRevShare: false,
};

const connectedStore: WooHandoffStore = {
	url: 'https://one.example',
	domain: 'one.example',
	id: 42,
};

const plan = ( overrides: Partial< Parameters< typeof getWooTicketPlan >[ 0 ] > = {} ) =>
	getWooTicketPlan( {
		question: 'technical-support',
		product: subscriptions,
		store: connectedStore,
		storeUrl: connectedStore.url,
		flags,
		chat,
		hasMerchantData: true,
		...overrides,
	} );

const WEBSITE_KEYS = [
	'websiteOption',
	'connectedSiteID',
	'websiteURL',
	'isSsrUnavailable',
	'isSiteOffline',
];

const websiteOf = ( request: object ) =>
	Object.fromEntries(
		Object.entries( request ).filter( ( [ key ] ) => WEBSITE_KEYS.includes( key ) )
	);

describe( 'getWooTicketPlan', () => {
	/** A wrong category gives the ticket the wrong Zendesk fields, so it lands in the wrong queue. */
	it.each( [
		[ 'technical-support', 'broken' ],
		[ 'pre-sales', 'before-buy' ],
		[ 'start-scale-store', 'start-scale-store' ],
		[ 'account', 'account' ],
		[ 'marketplace-vendor', 'vendor' ],
		[ null, 'account' ],
	] as const )( 'files %s under %s', ( question, helpCategory ) => {
		expect( plan( { question } ).request.helpCategory ).toBe( helpCategory );
	} );

	it( 'sends the chat, the store and the tags with a technical ticket', () => {
		expect(
			plan( { flags: { ...flags, isEmergency: true, emergencyType: 'checkout_broken' } } ).request
		).toEqual( {
			subject: 'My checkout is broken',
			message:
				'Sent from the Help Center on WooCommerce.com, after a chat with the AI assistant.\n' +
				'AI chat: 7873852\n' +
				'Store: https://one.example\n\n---\n\n' +
				'Merchant: My checkout is broken\n\n' +
				'AI: Which store is this about?\n\n' +
				'Merchant: The connected one.',
			helpCategory: 'broken',
			productSlug: 'woocommerce-subscriptions',
			websiteOption: 'connected-site',
			connectedSiteID: 42,
			websiteURL: 'https://one.example',
			tags: [ 'woo_support_flow_help_center', 'woo_emergency', 'woo_emergency_checkout_broken' ],
			aiChatId: 7873852,
		} );
	} );

	/**
	 * Without the store's System Status Report, or a flag saying why it's missing, `create-ticket`
	 * rejects a technical ticket. A vendor must never get the report, and a down site can't send one.
	 */
	it.each( [
		[
			'refreshes the report of a connected store',
			{},
			{ websiteOption: 'connected-site', connectedSiteID: 42, websiteURL: 'https://one.example' },
			{
				siteId: 42,
				fallback: {
					websiteOption: 'manual-site',
					websiteURL: 'https://one.example',
					isSsrUnavailable: true,
				},
			},
		],
		[
			'sends a store without an ID without a report',
			{ store: { url: 'https://one.example', domain: 'one.example' } },
			{ websiteOption: 'manual-site', websiteURL: 'https://one.example', isSsrUnavailable: true },
			null,
		],
		[
			"never sends a vendor the store's report",
			{ product: vendorProduct },
			{ websiteOption: 'manual-site', websiteURL: 'https://one.example', isSsrUnavailable: true },
			null,
		],
		[
			'marks a site that is down as offline',
			{ flags: { ...flags, isEmergency: true, emergencyType: 'site_down' } },
			{ websiteOption: 'manual-site', websiteURL: 'https://one.example', isSiteOffline: true },
			null,
		],
		[
			'sends the store without a report for presales',
			{ question: 'pre-sales' as const, product: null },
			{ websiteOption: 'manual-site', websiteURL: 'https://one.example' },
			null,
		],
	] )( '%s', ( _name, overrides, website, ssr ) => {
		const result = plan( overrides );

		expect( websiteOf( result.request ) ).toEqual( website );
		expect(
			result.ssr && { siteId: result.ssr.siteId, fallback: websiteOf( result.ssr.fallback ) }
		).toEqual( ssr );
	} );

	/** `create-ticket` rejects a technical ticket without a product, and there's no list to pick from. */
	it( 'files technical support without merchant data under WooCommerce Core, with a note', () => {
		const { request } = plan( { product: null, store: null, hasMerchantData: false } );

		expect( request.productSlug ).toBe( 'wc-core' );
		expect( request.message ).toContain(
			"WooCommerce.com didn't send the merchant's products, so this ticket is filed under WooCommerce Core."
		);
	} );
} );
