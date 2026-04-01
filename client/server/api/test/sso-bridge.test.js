import config from '@automattic/calypso-config';
import superagent from 'superagent';
import { ssoBridge } from '../sso-bridge';

jest.mock( '@automattic/calypso-config', () =>
	Object.assign( jest.fn(), { isEnabled: jest.fn() } )
);

jest.mock( 'superagent', () => ( {
	post: jest.fn(),
} ) );

describe( 'ssoBridge', () => {
	let req;
	let res;
	let next;

	beforeEach( () => {
		jest.clearAllMocks();

		req = {
			hostname: 'my.woo.ai',
			cookies: { wpcom_token: 'test-token' },
			query: { site_id: '123', sso_nonce: 'abc123' },
		};

		res = {
			redirect: jest.fn(),
		};

		next = jest.fn();
	} );

	it( 'calls next() when OAuth not enabled for hostname', async () => {
		config.mockReturnValue( {} );

		await ssoBridge( req, res, next );

		expect( next ).toHaveBeenCalled();
		expect( res.redirect ).not.toHaveBeenCalled();
	} );

	it( 'calls next() when no wpcom_token cookie', async () => {
		config.mockReturnValue( {
			'my.woo.ai': { features: { oauth: true } },
		} );
		req.cookies = {};

		await ssoBridge( req, res, next );

		expect( next ).toHaveBeenCalled();
		expect( res.redirect ).not.toHaveBeenCalled();
	} );

	it( 'calls next() when sso_error is present', async () => {
		config.mockReturnValue( {
			'my.woo.ai': { features: { oauth: true } },
		} );
		req.query = { sso_error: 'failed' };

		await ssoBridge( req, res, next );

		expect( next ).toHaveBeenCalled();
		expect( res.redirect ).not.toHaveBeenCalled();
	} );

	it( 'redirects to error when broker-sso-auth-redirect is 1', async () => {
		config.mockReturnValue( {
			'my.woo.ai': { features: { oauth: true } },
		} );
		req.query = { 'broker-sso-auth-redirect': '1', site_id: '123', sso_nonce: 'abc123' };

		await ssoBridge( req, res, next );

		expect( res.redirect ).toHaveBeenCalledWith( '/sso-bridge?sso_error=failed' );
		expect( next ).not.toHaveBeenCalled();
	} );

	it( 'redirects to error when site_id missing', async () => {
		config.mockReturnValue( {
			'my.woo.ai': { features: { oauth: true } },
		} );
		req.query = { sso_nonce: 'abc123' };

		await ssoBridge( req, res, next );

		expect( res.redirect ).toHaveBeenCalledWith( '/sso-bridge?sso_error=failed' );
		expect( next ).not.toHaveBeenCalled();
	} );

	it( 'redirects to error when sso_nonce missing', async () => {
		config.mockReturnValue( {
			'my.woo.ai': { features: { oauth: true } },
		} );
		req.query = { site_id: '123' };

		await ssoBridge( req, res, next );

		expect( res.redirect ).toHaveBeenCalledWith( '/sso-bridge?sso_error=failed' );
		expect( next ).not.toHaveBeenCalled();
	} );

	it( 'redirects to error when site_id is not numeric', async () => {
		config.mockReturnValue( {
			'my.woo.ai': { features: { oauth: true } },
		} );
		req.query = { site_id: 'abc', sso_nonce: 'abc123' };

		await ssoBridge( req, res, next );

		expect( res.redirect ).toHaveBeenCalledWith( '/sso-bridge?sso_error=failed' );
		expect( next ).not.toHaveBeenCalled();
	} );

	it( 'redirects to sso_url on successful API call with correct URL, Bearer header, and body', async () => {
		config.mockReturnValue( {
			'my.woo.ai': { features: { oauth: true } },
		} );

		const mockPost = {
			set: jest.fn().mockReturnThis(),
			send: jest.fn().mockResolvedValue( { body: { sso_url: 'https://example.com/sso' } } ),
		};
		superagent.post.mockReturnValue( mockPost );

		await ssoBridge( req, res, next );

		expect( superagent.post ).toHaveBeenCalledWith(
			'https://public-api.wordpress.com/rest/v1/jetpack-blogs/123/sso-authorize'
		);
		expect( mockPost.set ).toHaveBeenCalledWith( 'Authorization', 'Bearer test-token' );
		expect( mockPost.send ).toHaveBeenCalledWith( { sso_nonce: 'abc123' } );
		expect( res.redirect ).toHaveBeenCalledWith( 'https://example.com/sso' );
		expect( next ).not.toHaveBeenCalled();
	} );

	it( 'redirects to error when API call fails', async () => {
		config.mockReturnValue( {
			'my.woo.ai': { features: { oauth: true } },
		} );

		const mockPost = {
			set: jest.fn().mockReturnThis(),
			send: jest.fn().mockRejectedValue( new Error( 'Network error' ) ),
		};
		superagent.post.mockReturnValue( mockPost );

		await ssoBridge( req, res, next );

		expect( res.redirect ).toHaveBeenCalledWith( '/sso-bridge?sso_error=failed' );
		expect( next ).not.toHaveBeenCalled();
	} );

	it( 'redirects to error when API returns empty body', async () => {
		config.mockReturnValue( {
			'my.woo.ai': { features: { oauth: true } },
		} );

		const mockPost = {
			set: jest.fn().mockReturnThis(),
			send: jest.fn().mockResolvedValue( { body: {} } ),
		};
		superagent.post.mockReturnValue( mockPost );

		await ssoBridge( req, res, next );

		expect( res.redirect ).toHaveBeenCalledWith( '/sso-bridge?sso_error=failed' );
		expect( next ).not.toHaveBeenCalled();
	} );
} );
