/** @jest-environment jsdom */
import wpcom from 'calypso/lib/wp';
import { getCheckoutUrl, generateRedesign } from '../api';
import type { Redesign } from '../api';

jest.mock( 'calypso/lib/wp', () => ( { req: { post: jest.fn() } } ) );
const WPError: ( ...args: unknown[] ) => Error = jest.requireActual( 'wp-error' );

test( 'reads the actual wpcom.req WPError envelope for upgrade checkout', () => {
	const error = WPError( { path: '/apply', method: 'POST' }, 402, {
		code: 'site_redesign_upgrade_required',
		data: {
			checkout_url:
				'/checkout/example.wordpress.com/personal?redirect_to=%2Fsite-redesign%2Fexample.wordpress.com%3Fredesign%3Drd_1%26resume%3Dapply',
		},
	} );
	expect( getCheckoutUrl( error ) ).toBe(
		`${ window.location.origin }/checkout/example.wordpress.com/personal?redirect_to=%2Fsite-redesign%2Fexample.wordpress.com%3Fredesign%3Drd_1%26resume%3Dapply`
	);
} );

test.each( [
	'https://evil.example/checkout/test',
	'javascript:alert(1)',
	'http://[',
	'/plans/example',
] )( 'rejects unsafe or malformed checkout %s', ( checkout_url ) => {
	expect(
		getCheckoutUrl( { code: 'site_redesign_upgrade_required', data: { checkout_url } } )
	).toBeNull();
} );

test( 'does not turn permission or generation errors into an upgrade', () => {
	expect(
		getCheckoutUrl( { code: 'site_redesign_not_found', data: { checkout_url: '/checkout/test' } } )
	).toBeNull();
} );

test( 'confirms only the displayed server brief revision', () => {
	generateRedesign( { id: 'rd_1', site_id: 1, brief_revision: 3 } as Redesign );
	expect( wpcom.req.post ).toHaveBeenCalledWith(
		{ apiNamespace: 'wpcom/v2', path: '/sites/1/site-redesign/rd_1/generate' },
		{},
		{ brief_revision: 3, brief_confirmed: true }
	);
} );
