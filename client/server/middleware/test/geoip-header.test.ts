import { type Request, type Response } from 'express';
import middlewareGeoipHeader from '../geoip-header';

const mockInfo = jest.fn();

jest.mock( 'calypso/server/lib/logger', () => ( {
	getLogger: jest.fn().mockImplementation( () => ( { info: mockInfo } ) ),
} ) );

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
		const { promise, resolve } = Promise.withResolvers< void >();
		( global.fetch as jest.Mock ).mockImplementation( () => {
			resolve();
			return Promise.resolve( {
				json: () => Promise.resolve( { country_short: 'US' } ),
			} );
		} );

		middlewareGeoipHeader();

		await promise;
		expect( global.fetch ).toHaveBeenCalledTimes( 1 );
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
		expect( mockInfo ).toHaveBeenCalledWith( 'Failed to fetch geolocation' );
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

	it( 'should not re-fetch on next request if previous fetch failed', async () => {
		( global.fetch as jest.Mock ).mockRejectedValue( new Error( 'Network error' ) );
		const next = jest.fn();

		const middleware = middlewareGeoipHeader();

		const req1 = { headers: {} } as Request;
		await middleware( req1, response, next );

		expect( req1.headers[ 'x-geoip-country-code' ] ).toBeUndefined();
		expect( mockInfo ).toHaveBeenCalledWith( 'Failed to fetch geolocation' );

		const req2 = { headers: {} } as Request;
		await middleware( req2, response, next );

		expect( global.fetch ).toHaveBeenCalledTimes( 1 );
		expect( mockInfo ).toHaveBeenCalledTimes( 1 );
		expect( req2.headers[ 'x-geoip-country-code' ] ).toBeUndefined();
	} );
} );
