import config from '@automattic/calypso-config';
import { type Request, type Response, type NextFunction } from 'express';
import { type Details as UserAgentDetails, parse as parseUserAgent } from 'express-useragent';
import unsupportedBrowserMiddleware from '../../middleware/unsupported-browser';

jest.mock( '@automattic/calypso-config', () =>
	Object.assign(
		jest.fn().mockImplementation( ( key ) => {
			if ( key === 'magnificent_non_en_locales' ) {
				return [ 'es' ];
			}
		} ),
		{
			isEnabled: jest.fn().mockImplementation( ( feature ) => {
				if ( feature === 'redirect-fallback-browsers' ) {
					return true;
				}
				if ( feature === 'redirect-fallback-browsers/test' ) {
					return false;
				}
				return false;
			} ),
		}
	)
);

jest.mock( 'calypso/server/lib/analytics', () => ( {
	tracks: {
		recordEvent: jest.fn(),
	},
} ) );

describe( 'unsupported-browser', () => {
	let req: Partial< Request > & { useragent: UserAgentDetails };
	let res: Partial< Response > & { redirect: jest.Mock; cookie: jest.Mock };
	let next: NextFunction;

	beforeEach( () => {
		jest.clearAllMocks();

		req = {
			useragent: {} as UserAgentDetails,
			path: '/test',
			cookies: {},
			query: {},
			originalUrl: '/test',
		};

		res = {
			redirect: jest.fn(),
			cookie: jest.fn(),
		};

		next = jest.fn();
	} );

	it( 'should call next() if feature flag is disabled', () => {
		( config.isEnabled as jest.Mock ).mockReturnValueOnce( false );

		unsupportedBrowserMiddleware()( req, res, next );

		expect( next ).toHaveBeenCalled();
		expect( res.redirect ).not.toHaveBeenCalled();
	} );

	it( 'should call next() for allowed paths', () => {
		// Use an unsupported browser that should normally be redirected
		req.useragent = parseUserAgent(
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36'
		);

		const allowedPaths = [
			'/browsehappy',
			'/themes',
			'/es/themes',
			'/theme/twentytwenty',
			'/calypso/style.css',
		];

		allowedPaths.forEach( ( path ) => {
			unsupportedBrowserMiddleware()( { ...req, path }, res, next );
			expect( next ).toHaveBeenCalled();
			expect( res.redirect ).not.toHaveBeenCalled();
		} );
	} );

	it( 'should call next() if bypass_target_redirection cookie is true', () => {
		req.cookies.bypass_target_redirection = 'true';

		unsupportedBrowserMiddleware()( req, res, next );

		expect( next ).toHaveBeenCalled();
		expect( res.redirect ).not.toHaveBeenCalled();
	} );

	it( 'should set cookie and call next() if bypassTargetRedirection query param is true', () => {
		unsupportedBrowserMiddleware()(
			{ ...req, query: { ...req.query, bypassTargetRedirection: 'true' } },
			res,
			next
		);

		expect( res.cookie ).toHaveBeenCalledWith(
			'bypass_target_redirection',
			true,
			expect.objectContaining( {
				expires: expect.any( Date ),
				httpOnly: true,
				secure: true,
			} )
		);
		expect( next ).toHaveBeenCalled();
		expect( res.redirect ).not.toHaveBeenCalled();
	} );

	describe( 'unsupported browsers', () => {
		test.each( [
			{
				description: 'IE 11',
				userAgent: 'Mozilla/5.0 (Windows NT 10.0; Trident/7.0; rv:11.0) like Gecko',
			},
			{
				description: 'Edge 79',
				userAgent:
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.74 Safari/537.36 Edg/79.0.309.43',
			},
			{
				description: 'Chrome 79',
				userAgent:
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36',
			},
			{
				description: 'Firefox 73',
				userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:73.0) Gecko/20100101 Firefox/73.0',
			},
			{
				description: 'Safari 13.0',
				userAgent:
					'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0 Safari/605.1.15',
			},
			{
				description: 'iOS 13.3',
				userAgent:
					'Mozilla/5.0 (iPhone; CPU iPhone OS 13_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0 Mobile/15E148 Safari/604.1',
			},
			{
				description: 'Opera 66',
				userAgent:
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.87 Safari/537.36 OPR/66.0.3575.31',
			},
		] )( 'should redirect $description', ( { userAgent } ) => {
			req.useragent = parseUserAgent( userAgent );

			unsupportedBrowserMiddleware()( req, res, next );

			expect( res.redirect ).toHaveBeenCalledWith( '/browsehappy?from=%2Ftest' );
			expect( next ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'supported browsers', () => {
		test.each( [
			{
				description: 'Chrome 80',
				userAgent:
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36',
			},
			{
				description: 'Firefox 74',
				userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:74.0) Gecko/20100101 Firefox/74.0',
			},
			{
				description: 'Safari 14.0',
				userAgent:
					'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
			},
			{
				description: 'WordPress Desktop app',
				userAgent:
					'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36 WordPressDesktop/7.0.0 Electron/13.5.1',
			},
			{
				description: 'Edge 80',
				userAgent:
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36 Edg/80.0.361.69',
			},
			{
				description: 'Opera 67',
				userAgent:
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.87 Safari/537.36 OPR/67.0.3575.31',
			},
		] )( 'should not redirect $description', ( { userAgent } ) => {
			req.useragent = parseUserAgent( userAgent );

			unsupportedBrowserMiddleware()( req, res, next );

			expect( next ).toHaveBeenCalled();
			expect( res.redirect ).not.toHaveBeenCalled();
		} );
	} );

	it( 'should force redirect when test flag is enabled', () => {
		// Override config.isEnabled for this test to enable test mode
		( config.isEnabled as jest.Mock ).mockImplementation(
			( feature ) =>
				feature === 'redirect-fallback-browsers' || feature === 'redirect-fallback-browsers/test'
		);

		// Use a modern browser that shouldn't normally be redirected
		req.useragent = parseUserAgent(
			'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Safari/605.1.15'
		);

		unsupportedBrowserMiddleware()( req, res, next );

		expect( res.redirect ).toHaveBeenCalledWith( '/browsehappy?from=%2Ftest' );
		expect( next ).not.toHaveBeenCalled();
	} );
} );
