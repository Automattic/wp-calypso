/**
 * @jest-environment jsdom
 */
import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { updateDependencies } from 'calypso/state/signup/actions';
import controller from '../controller';

jest.mock( '../main', () => () => null );
jest.mock( 'calypso/signup/config/flows', () => ( {
	getFlow: () => ( { steps: [ 'plans-site-selected-legacy' ] } ),
} ) );
jest.mock( '../config/step-components', () => ( {
	getStepComponent: async () => () => null,
} ) );
jest.mock( '../utils', () => ( {
	...jest.requireActual( '../utils' ),
	getFlowName: ( params ) => params.flowName,
	getStepName: ( params ) => params.stepName,
	getStepSectionName: () => undefined,
	getFlowPageTitle: () => '',
} ) );

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
			'/setup/launch-site?siteSlug=example.wordpress.com'
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

	it( 'drops the locale, like the server redirect', () => {
		run( { flowName: 'launch-site', lang: 'es' }, { siteSlug: 'example.wordpress.com' } );

		expect( window.location.replace ).toHaveBeenCalledWith(
			'/setup/launch-site?siteSlug=example.wordpress.com'
		);
	} );

	it( 'sends the retired WooCommerce installer to the plugin page', () => {
		const next = run(
			{ flowName: 'woocommerce-install', stepName: 'store-address' },
			{ siteSlug: 'example.wordpress.com' }
		);

		expect( window.location.replace ).toHaveBeenCalledWith(
			'/plugins/woocommerce/example.wordpress.com'
		);
		expect( next ).not.toHaveBeenCalled();
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

describe( 'start', () => {
	// `start` reads the query from a module-level context saved on first entry, so each run loads
	// the controller fresh.
	const run = async ( flowName, query ) => {
		const dispatch = jest.fn();
		const store = { dispatch, getState: () => ( { currentUser: { id: 1 } } ) };
		const context = { params: { flowName, stepName: 'plans' }, query, store };

		await jest.isolateModulesAsync( async () => {
			const { default: isolatedController } = await import( '../controller' );
			isolatedController.saveInitialContext( context, () => {} );
			await isolatedController.start( context, () => {} );
		} );

		return dispatch;
	};

	it.each( [ 'launch-site', 'site-selected' ] )(
		'clears %s landing dependencies left over from an earlier visit',
		async ( flowName ) => {
			const dispatch = await run( flowName, { siteSlug: 'example.wordpress.com' } );

			expect( dispatch ).toHaveBeenCalledWith(
				updateDependencies( { back_to: null, redirect_to: null, refParameter: null } )
			);
		}
	);

	it( 'takes the site-selected landing dependencies from the query it was entered with', async () => {
		const dispatch = await run( 'site-selected', {
			siteSlug: 'example.wordpress.com',
			back_to: '/back',
			redirect_to: '/next',
			ref: 'domains',
		} );

		expect( dispatch ).toHaveBeenCalledWith(
			updateDependencies( { back_to: '/back', redirect_to: '/next', refParameter: 'domains' } )
		);
	} );
} );

describe( 'saveInitialContext', () => {
	const flowName = 'onboarding-with-email';

	it( 'keeps the entry query across steps and refreshes it when the flow is entered again', async () => {
		const dispatch = jest.fn();
		const store = { dispatch, getState: () => ( { currentUser: { id: 1 } } ) };
		const visit = async ( isolatedController, stepName, query ) => {
			const context = { params: { flowName, stepName }, query, store };
			isolatedController.saveInitialContext( context, () => {} );
			await isolatedController.start( context, () => {} );
		};

		await jest.isolateModulesAsync( async () => {
			const { default: isolatedController } = await import( '../controller' );

			await visit( isolatedController, undefined, { ref: 'first' } );
			await visit( isolatedController, 'mailbox', {} );
			await visit( isolatedController, undefined, { ref: 'second' } );
		} );

		const refParameters = dispatch.mock.calls
			.map( ( [ action ] ) => action.dependencies?.refParameter )
			.filter( Boolean );
		expect( refParameters ).toEqual( [ 'first', 'first', 'second' ] );
	} );
} );

describe( 'redirectWithoutLocaleIfLoggedIn', () => {
	it( 'keeps the entry query when dropping the locale', () => {
		jest.spyOn( config, 'isEnabled' ).mockReturnValue( true );
		const redirect = jest.spyOn( page, 'redirect' ).mockImplementation( () => {} );
		const store = { getState: () => ( { currentUser: { id: 1 } } ) };

		controller.redirectWithoutLocaleIfLoggedIn(
			{
				params: { flowName: 'onboarding-with-email', lang: 'fr' },
				query: { tier: 'premium' },
				querystring: 'tier=premium',
				store,
			},
			jest.fn()
		);

		expect( redirect ).toHaveBeenCalledWith( '/start/onboarding-with-email?tier=premium' );
	} );
} );
