/**
 * @jest-environment jsdom
 */
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import controller from '../controller';

jest.mock( '../main', () => () => null );
jest.mock( 'calypso/lib/analytics/tracks', () => ( { recordTracksEvent: jest.fn() } ) );
jest.mock( 'calypso/signup/config/flows', () => ( {} ) );

describe( 'redirectLegacyFlow', () => {
	const originalLocation = window.location;

	beforeEach( () => {
		Object.defineProperty( window, 'location', {
			value: { ...originalLocation, replace: jest.fn() },
			writable: true,
			configurable: true,
		} );
	} );

	afterAll( () => {
		Object.defineProperty( window, 'location', {
			value: originalLocation,
			writable: true,
			configurable: true,
		} );
	} );

	const run = ( params, query = {} ) => {
		const next = jest.fn();
		controller.redirectLegacyFlow( { params, query }, next );
		return next;
	};

	it( 'sends legacy launch-site to the Stepper flow', () => {
		const next = run(
			{ flowName: 'launch-site', stepName: 'domains-launch', lang: 'es' },
			{ siteSlug: 'example.wordpress.com' }
		);

		expect( window.location.replace ).toHaveBeenCalledWith(
			'/setup/launch-site/es?siteSlug=example.wordpress.com'
		);
		expect( next ).not.toHaveBeenCalled();
	} );

	it( 'records legacy launch-site hits', () => {
		controller.redirectLegacyFlow(
			{ params: { flowName: 'launch-site' }, query: {}, path: '/start/launch-site' },
			jest.fn()
		);

		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_legacy_launch_site_redirect', {
			source: 'client',
			original_url: '/start/launch-site',
			referrer: expect.any( String ),
		} );
	} );

	it( 'still redirects legacy plan flows', () => {
		run( { flowName: 'business' } );

		expect( window.location.replace ).toHaveBeenCalledWith(
			expect.stringContaining( '/setup/onboarding?' )
		);
	} );

	it( 'leaves other flows alone', () => {
		const next = run( { flowName: 'domain' } );

		expect( window.location.replace ).not.toHaveBeenCalled();
		expect( next ).toHaveBeenCalled();
	} );
} );
