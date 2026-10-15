/**
 * @jest-environment jsdom
 */
import controller from '../controller';

jest.mock( '../main', () => () => null );
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

	const run = ( params, query = {}, dependencyStore = {} ) => {
		const next = jest.fn();
		const store = { getState: () => ( { signup: { dependencyStore } } ) };
		controller.redirectLegacyFlow( { params, query, store }, next );
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

	it( 'falls back to the stored site when the query has none', () => {
		run( { flowName: 'launch-site' }, {}, { siteSlug: 'stored.wordpress.com' } );

		expect( window.location.replace ).toHaveBeenCalledWith(
			'/setup/launch-site?siteSlug=stored.wordpress.com'
		);
	} );

	it( 'prefers the query site over the stored one', () => {
		run(
			{ flowName: 'launch-site' },
			{ siteSlug: 'example.wordpress.com' },
			{ siteSlug: 'stored.wordpress.com' }
		);

		expect( window.location.replace ).toHaveBeenCalledWith(
			'/setup/launch-site?siteSlug=example.wordpress.com'
		);
	} );

	it( 'drops the default locale, like the server redirect', () => {
		run( { flowName: 'launch-site', lang: 'en' }, { siteSlug: 'example.wordpress.com' } );

		expect( window.location.replace ).toHaveBeenCalledWith(
			'/setup/launch-site?siteSlug=example.wordpress.com'
		);
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
