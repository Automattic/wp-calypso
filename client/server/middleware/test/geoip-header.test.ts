import { type Request, type Response } from 'express';
import middlewareGeoipHeader from '../geoip-header';

jest.useFakeTimers();

describe( 'geoip-header middleware', () => {
	let request: Request;
	let response: Response;

	beforeEach( () => {
		jest.clearAllMocks();
		jest.spyOn( global, 'fetch' );
		request = { headers: {} } as Request;
		response = {} as Response;
	} );

	it( 'should fetch country code on initialization', async () => {
		( global.fetch as jest.Mock ).mockResolvedValueOnce( {
			json: () => Promise.resolve( { country_short: 'US' } ),
		} );

		middlewareGeoipHeader();

		await jest.runAllTimersAsync();
		expect( global.fetch ).toHaveBeenCalledWith( 'https://public-api.wordpress.com/geo/' );
	} );

	it( 'should add country code header to request when available', async () => {
		( global.fetch as jest.Mock ).mockResolvedValueOnce( {
			json: () => Promise.resolve( { country_short: 'US' } ),
		} );
		const next = jest.fn();

		const middleware = middlewareGeoipHeader();

		await middleware( request, response, next );

		expect( request.headers[ 'x-geoip-country-code' ] ).toBe( 'US' );
		expect( next ).toHaveBeenCalled();
	} );

	it( 'should not add header when country code is not available', async () => {
		( global.fetch as jest.Mock ).mockRejectedValueOnce( new Error( 'Network error' ) );
		const next = jest.fn();

		const middleware = middlewareGeoipHeader();

		await middleware( request, response, next );

		expect( request.headers[ 'x-geoip-country-code' ] ).toBeUndefined();
		expect( next ).toHaveBeenCalled();
	} );

	it( 'should avoid duplicate requests when country code is available', async () => {
		( global.fetch as jest.Mock ).mockResolvedValueOnce( {
			json: () => Promise.resolve( { country_short: 'US' } ),
		} );
		const next = jest.fn();

		const middleware = middlewareGeoipHeader();

		await middleware( request, response, next );
		await middleware( request, response, next );
		await middleware( request, response, next );

		expect( global.fetch ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should re-fetch on next request if previous fetch failed', async () => {
		( global.fetch as jest.Mock ).mockRejectedValue( new Error( 'Network error' ) );
		const next = jest.fn();

		const middleware = middlewareGeoipHeader();

		const req1 = { headers: {} } as Request;
		await jest.runAllTimersAsync();
		await middleware( req1, response, next );

		expect( req1.headers[ 'x-geoip-country-code' ] ).toBeUndefined();

		// Second request succeeds
		( global.fetch as jest.Mock ).mockResolvedValueOnce( {
			json: () => Promise.resolve( { country_short: 'US' } ),
		} );

		const req2 = { headers: {} } as Request;
		await middleware( req2, response, next );

		expect( global.fetch ).toHaveBeenCalledTimes( 3 );
		expect( req2.headers[ 'x-geoip-country-code' ] ).toBe( 'US' );
	} );
} );
