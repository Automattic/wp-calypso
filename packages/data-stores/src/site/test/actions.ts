/**
 * @jest-environment jsdom
 */

import { createActions } from '../actions';
import { SiteLaunchError } from '../types';

const client_id = 'magic_client_id';
const client_secret = 'magic_client_secret';
const mockedClientCredentials = { client_id, client_secret };
const siteId = 12345;
const error = SiteLaunchError.INTERNAL;
const countries = {
	'AL:AL-01': 'Albania — Berat',
	'AL:AL-09': 'Albania — Dibër',
	'AL:AL-02': 'Albania — Durrës',
	'AL:AL-03': 'Albania — Elbasan',
	'AL:AL-04': 'Albania — Fier',
	'AL:AL-05': 'Albania — Gjirokastër',
	'AL:AL-06': 'Albania — Korçë',
	'AL:AL-07': 'Albania — Kukës',
	'AL:AL-08': 'Albania — Lezhë',
	'AL:AL-10': 'Albania — Shkodër',
	'AL:AL-11': 'Albania — Tirana',
	'AL:AL-12': 'Albania — Vlorë',
	'DZ:DZ-01': 'Algeria — Adrar',
	'DZ:DZ-02': 'Algeria — Chlef',
	'DZ:DZ-03': 'Algeria — Laghouat',
	'DZ:DZ-04': 'Algeria — Oum El Bouaghi',
};

describe( 'Site Actions', () => {
	describe( 'LAUNCH_SITE Actions', () => {
		it( 'should return a LAUNCH_SITE_START Action', () => {
			const { launchSiteStart } = createActions( mockedClientCredentials );

			const expected = {
				type: 'LAUNCH_SITE_START',
				siteId,
			};

			expect( launchSiteStart( siteId ) ).toEqual( expected );
		} );

		it( 'should return a LAUNCH_SITE_SUCCESS Action', () => {
			const { launchSiteSuccess } = createActions( mockedClientCredentials );

			const expected = {
				type: 'LAUNCH_SITE_SUCCESS',
				siteId,
			};

			expect( launchSiteSuccess( siteId ) ).toEqual( expected );
		} );

		it( 'should return a LAUNCH_SITE_FAILURE Action', () => {
			const { launchSiteFailure } = createActions( mockedClientCredentials );

			const expected = {
				type: 'LAUNCH_SITE_FAILURE',
				siteId,
				error,
			};

			expect( launchSiteFailure( siteId, error ) ).toEqual( expected );
		} );

		it( 'should launch a site successfully', () => {
			const { launchSite } = createActions( mockedClientCredentials );
			const generator = launchSite( siteId );

			const mockedApiResponse = {
				request: {
					apiVersion: '1.1',
					method: 'post',
					path: `/sites/${ siteId }/launch`,
				},
				type: 'WPCOM_REQUEST',
			};

			// First iteration: LAUNCH_SITE_IDLE is fired
			expect( generator.next().value ).toEqual( {
				type: 'LAUNCH_SITE_START',
				siteId,
			} );

			// Second iteration: WP_COM_REQUEST is fired
			expect( generator.next().value ).toEqual( mockedApiResponse );

			// Third iteration: LAUNCH_SITE_SUCCESS is fired
			expect( generator.next().value ).toEqual( {
				type: 'LAUNCH_SITE_SUCCESS',
				siteId,
			} );
		} );

		it( 'should fail to launch a site', () => {
			const { launchSite } = createActions( mockedClientCredentials );
			const generator = launchSite( siteId );

			const mockedApiResponse = {
				request: {
					apiVersion: '1.1',
					method: 'post',
					path: `/sites/${ siteId }/launch`,
				},
				type: 'WPCOM_REQUEST',
			};

			// First iteration: LAUNCH_SITE_IDLE is fired
			expect( generator.next().value ).toEqual( {
				type: 'LAUNCH_SITE_START',
				siteId,
			} );

			// Second iteration: WP_COM_REQUEST is fired
			expect( generator.next().value ).toEqual( mockedApiResponse );

			// Third iteration: Throw an error
			expect( generator.throw( error ).value ).toEqual( {
				type: 'LAUNCH_SITE_FAILURE',
				siteId,
				error,
			} );

			// Fourth iteration: Complete the cycle
			const finalResult = generator.next();

			expect( finalResult.value ).toBeFalsy();
			expect( finalResult.done ).toBe( true );
		} );
	} );

	describe( 'COUNTRIES Actions', () => {
		it( 'should return a FETCH_COUNTRIES Action', () => {
			const { fetchCountries } = createActions( mockedClientCredentials );

			const expected = {
				type: 'FETCH_COUNTRIES',
			};

			expect( fetchCountries() ).toEqual( expected );
		} );
		it( 'should return a RECEIVE_COUNTRIES Action', () => {
			const { receiveCountries } = createActions( mockedClientCredentials );

			const expected = {
				type: 'RECEIVE_COUNTRIES',
				countries,
			};

			expect( receiveCountries( countries ) ).toEqual( expected );
		} );
		it( 'should return a RECEIVE_COUNTRIES_FAILED Action', () => {
			const { receiveCountriesFailed } = createActions( mockedClientCredentials );
			const error = {
				error: 'test error',
				status: 500,
				statusCode: 500,
				name: 'test',
				message: 'This is a test error',
			};

			const expected = {
				type: 'RECEIVE_COUNTRIES_FAILED',
				error,
			};

			expect( receiveCountriesFailed( error ) ).toEqual( expected );
		} );
	} );
} );
