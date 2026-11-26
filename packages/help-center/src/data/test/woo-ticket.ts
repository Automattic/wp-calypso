import apiFetch from '@wordpress/api-fetch';
import { vi } from 'vitest';
import { getWooTicketErrorMessage, sendWooTicket } from '../woo-ticket';
import type { WooTicketPlan } from '../../human-routing/woo-ticket';

vi.mock( '@wordpress/api-fetch', () => ( { default: vi.fn() } ) );

const base = { subject: 'Help', message: 'Chat', helpCategory: 'broken', tags: [] } as const;

const plan: WooTicketPlan = {
	request: {
		...base,
		websiteOption: 'connected-site',
		connectedSiteID: 42,
		websiteURL: 'https://one.example',
	},
	ssr: {
		siteId: 42,
		fallback: {
			...base,
			websiteOption: 'manual-site',
			websiteURL: 'https://one.example',
			isSsrUnavailable: true,
		},
	},
};

const ticketBody = () =>
	vi
		.mocked( apiFetch )
		.mock.calls.find( ( [ options ] ) => options.path?.endsWith( '/create-ticket' ) )?.[ 0 ].data;

beforeEach( () => {
	vi.mocked( apiFetch ).mockReset();
} );

describe( 'sendWooTicket', () => {
	/**
	 * A failed refresh must still send the ticket, flagged as having no report, or `create-ticket`
	 * rejects it and the merchant can't reach anyone.
	 */
	it.each( [
		[ 'sends the connected store after a refresh', true, plan.request ],
		[ 'sends the ticket without the report when the refresh fails', false, plan.ssr!.fallback ],
	] )( '%s', async ( _name, refreshes, body ) => {
		vi.mocked( apiFetch ).mockImplementation( async ( { path } ) => {
			if ( path?.includes( '/get-ssr' ) && ! refreshes ) {
				throw {
					success: false,
					data: [ "We couldn't get the System Status Report from your site." ],
				};
			}
			return { success: true, data: 'Sent' };
		} );

		const result = await sendWooTicket( plan );

		expect( vi.mocked( apiFetch ).mock.calls[ 0 ][ 0 ].path ).toBe(
			'/wccom/support-form/get-ssr?site-id=42'
		);
		expect( ticketBody() ).toEqual( body );
		expect( result ).toEqual( { ssrRefreshed: refreshes } );
	} );
} );

describe( 'getWooTicketErrorMessage', () => {
	/** The merchant sees why the ticket failed, whichever way WooCommerce.com reports it. */
	it.each( [
		[ 'the support form', { success: false, data: [ 'Invalid product.' ] }, 'Invalid product.' ],
		[
			'the REST API',
			{ code: 'rest_cookie_invalid_nonce', message: 'Cookie check failed' },
			'Cookie check failed',
		],
		[ 'an unknown error', 'boom', null ],
	] )( 'reads the message from %s', ( _name, error, expected ) => {
		expect( getWooTicketErrorMessage( error ) ).toBe( expected );
	} );
} );
