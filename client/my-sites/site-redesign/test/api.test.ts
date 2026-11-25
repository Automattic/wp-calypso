/**
 * @jest-environment jsdom
 */
import wpcom from 'calypso/lib/wp';
import { generateRedesign, getCheckoutUrl } from '../api';

jest.mock( '@automattic/calypso-config', () => ( { isEnabled: () => false } ) );
jest.mock( 'calypso/lib/wp', () => ( { req: { get: jest.fn(), post: jest.fn() } } ) );

describe( 'generateRedesign', () => {
	afterEach( () => jest.clearAllMocks() );

	it( 'asks for a new batch only when told to', async () => {
		await generateRedesign( 1, 'rd_1' );
		await generateRedesign( 1, 'rd_1', true );

		const bodies = jest.mocked( wpcom.req.post ).mock.calls.map( ( args: unknown[] ) => args[ 2 ] );
		expect( bodies ).toEqual( [
			{ brief_confirmed: true },
			{ brief_confirmed: true, new_batch: true },
		] );
	} );
} );

describe( 'getCheckoutUrl', () => {
	const checkoutUrl =
		'/checkout/example.wordpress.com/personal?redirect_to=' +
		encodeURIComponent( '/site-redesign/example.wordpress.com?redesign=rd_1&resume=apply' );
	const upgradeRequired = {
		code: 'site_redesign_upgrade_required',
		data: { checkout_url: checkoutUrl },
	};
	const returnOf = ( url: string | null ) =>
		new URL( url as string, 'https://x.test' ).searchParams.get( 'redirect_to' );

	it( 'keeps the entry ref on the page checkout returns to', () => {
		expect( returnOf( getCheckoutUrl( upgradeRequired, 'marketing_bar' ) ) ).toBe(
			'/site-redesign/example.wordpress.com?redesign=rd_1&resume=apply&ref=marketing_bar'
		);
	} );

	it( 'leaves the URL as the server sent it without a ref', () => {
		expect( getCheckoutUrl( upgradeRequired ) ).toBe( checkoutUrl );
	} );
} );
