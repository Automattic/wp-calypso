/**
 * @jest-environment jsdom
 */
// @ts-nocheck - the flow test helpers are untyped
import config from '@automattic/calypso-config';
import { isCurrentUserLoggedIn } from '@automattic/data-stores/src/user/selectors';
import { act, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import StepRoute from 'calypso/landing/stepper/declarative-flow/internals/components/step-route';
import { STEPS } from 'calypso/landing/stepper/declarative-flow/internals/steps';
import { AssertConditionState } from 'calypso/landing/stepper/declarative-flow/internals/types';
import {
	getFlowLocation,
	renderFlow,
	runFlowNavigation,
} from 'calypso/landing/stepper/declarative-flow/test/helpers';
import { useFlowLocale } from 'calypso/landing/stepper/hooks/use-flow-locale';
import { useIsSiteAdmin } from 'calypso/landing/stepper/hooks/use-is-site-admin';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { goToCheckout, goToUnifiedCheckout } from 'calypso/landing/stepper/utils/checkout';
import {
	clearSignupDestinationCookie,
	persistSignupDestination,
	setSignupCompleteFlowName,
	setSignupCompleteSiteID,
} from 'calypso/signup/storageUtils';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { renderHookWithProvider, renderWithProvider } from 'calypso/test-helpers/testing-library';
import staticSiteImportFlow from '../static-site-import-flow';
const originalLocation = window.location;

jest.mock( 'calypso/landing/stepper/utils/checkout' );
jest.mock( '@automattic/data-stores/src/user/selectors' );
jest.mock( 'calypso/state/current-user/selectors' );
jest.mock( 'calypso/landing/stepper/hooks/use-site' );
jest.mock( 'calypso/landing/stepper/hooks/use-flow-locale' );
jest.mock( 'calypso/landing/stepper/hooks/use-is-site-admin' );

const runNavigation = ( options: Parameters< typeof runFlowNavigation >[ 1 ] ) =>
	runFlowNavigation( staticSiteImportFlow, options, 'forward' );

const SOURCE = { from: 'source.example.com', platform: 'wix' };
const SITE = { siteId: 42, siteSlug: 'destination.example.com' };
const PAID_SITE = { ID: SITE.siteId, URL: `https://${ SITE.siteSlug }`, plan: { is_free: false } };
const PLAN = { cartItems: [ { product_slug: 'business-bundle' } ] };
const readingPath = '/setup/static-site-import/static-site-import-reading';
const identifyPath = '/setup/site-migration/site-migration-identify';
const plansPath = '/setup/static-site-import/plans';

const parseUrl = ( url: string ) => {
	const [ path, query = '' ] = url.split( '?' );
	return { path, query: Object.fromEntries( new URLSearchParams( query ) ) };
};

const lastExit = () => {
	const calls = [
		...( window.location.assign as jest.Mock ).mock.calls,
		...( window.location.replace as jest.Mock ).mock.calls,
	];
	return parseUrl( String( calls.at( -1 )?.[ 0 ] ?? '' ) );
};

describe( 'Static site import flow', () => {
	beforeAll( () => {
		Object.defineProperty( window, 'location', {
			value: { ...originalLocation, assign: jest.fn(), replace: jest.fn() },
		} );
	} );

	afterAll( () => {
		Object.defineProperty( window, 'location', { value: originalLocation } );
	} );

	beforeEach( () => {
		window.sessionStorage.clear();
		clearSignupDestinationCookie();
		config.enable( 'migration/non-wordpress-source' );
		window.location.pathname = plansPath;
		window.location.search = '';
		jest.clearAllMocks();
		jest.mocked( isCurrentUserLoggedIn ).mockReturnValue( true );
		jest.mocked( isUserLoggedIn ).mockReturnValue( true );
		jest.mocked( useSite ).mockReturnValue( undefined );
		jest.mocked( useFlowLocale ).mockReturnValue( 'en' );
		jest.mocked( useIsSiteAdmin ).mockReturnValue( { isAdmin: true, isFetching: false } );
	} );

	it.each( [ false, true ] )(
		'restores the created destination after browser Back (cached page: %s)',
		( cachedPage ) => {
			const plansUrl = `${ plansPath }/es?${ new URLSearchParams( SOURCE ) }`;
			window.location.href = `https://example.com${ plansUrl }`;
			const saveCreatedSite = () => {
				setSignupCompleteFlowName( 'static-site-import' );
				setSignupCompleteSiteID( '42' );
				persistSignupDestination(
					`${ readingPath }?${ new URLSearchParams( SOURCE ) }&siteId=:siteId`
				);
			};
			if ( ! cachedPage ) {
				saveCreatedSite();
			}
			renderHookWithProvider(
				() => staticSiteImportFlow.useStepNavigation( STEPS.UNIFIED_PLANS.slug, jest.fn() ),
				{
					wrapper: ( { children } ) => (
						<MemoryRouter initialEntries={ [ plansUrl ] }>{ children }</MemoryRouter>
					),
				}
			);
			expect( window.location.replace ).toHaveBeenCalledTimes( cachedPage ? 0 : 1 );
			if ( cachedPage ) {
				saveCreatedSite();
				act( () =>
					window.dispatchEvent( new PageTransitionEvent( 'pageshow', { persisted: true } ) )
				);
			}
			expect( window.location.replace ).toHaveBeenCalledWith(
				`${ window.location.href }&siteId=42`
			);
		}
	);

	it.each( [
		{ flow: 'onboarding', source: SOURCE, query: SOURCE },
		{
			flow: 'static-site-import',
			source: { ...SOURCE, from: 'another.example.com' },
			query: SOURCE,
		},
		{ flow: 'static-site-import', source: SOURCE, query: { ...SOURCE, siteId: 99 } },
	] )(
		'does not restore a destination from an unrelated checkout: %j',
		( { flow, source, query } ) => {
			setSignupCompleteFlowName( flow );
			setSignupCompleteSiteID( '42' );
			persistSignupDestination(
				`${ readingPath }?${ new URLSearchParams( source ) }&siteId=:siteId`
			);
			runNavigation( { from: STEPS.UNIFIED_PLANS, dependencies: PLAN, query } );
			expect( window.location.replace ).not.toHaveBeenCalled();
		}
	);

	it( 'retries payment for the recovered destination and still applies its signup settings', () => {
		setSignupCompleteFlowName( 'static-site-import' );
		setSignupCompleteSiteID( '42' );
		jest.mocked( useSite ).mockReturnValue( { ...PAID_SITE, plan: { is_free: true } } );
		runNavigation( {
			from: STEPS.UNIFIED_PLANS,
			dependencies: PLAN,
			query: { ...SOURCE, siteId: 42 },
		} );
		expect( goToUnifiedCheckout ).not.toHaveBeenCalled();
		const { destination, siteSlug } = jest.mocked( goToCheckout ).mock.calls[ 0 ][ 0 ];
		expect( siteSlug ).toBe( SITE.siteSlug );
		expect( parseUrl( destination ).query ).toMatchObject( {
			siteId: '42',
			applySiteSettings: '1',
		} );
	} );

	it( 'sends users who cannot manage the destination site to the start page', () => {
		jest.mocked( useIsSiteAdmin ).mockReturnValue( { isAdmin: false, isFetching: false } );

		renderFlow( staticSiteImportFlow ).runUseAssertionCondition( {
			currentStep: STEPS.STATIC_SITE_IMPORT_READING.slug,
		} );

		expect( window.location.assign ).toHaveBeenCalledWith( '/start' );
	} );

	it( 'does not wait for a destination site before checkout', () => {
		jest.mocked( useIsSiteAdmin ).mockReturnValue( { isAdmin: null, isFetching: true } );

		const result = renderFlow( staticSiteImportFlow ).runUseAssertionCondition( {
			currentStep: STEPS.UNIFIED_PLANS.slug,
			currentURL: `${ plansPath }?${ new URLSearchParams( SOURCE ) }`,
		} );

		expect( result.state ).toBe( AssertConditionState.SUCCESS );
		expect( window.location.assign ).not.toHaveBeenCalled();
	} );

	it( 'waits for the destination site when returning from checkout', () => {
		jest.mocked( useIsSiteAdmin ).mockReturnValue( { isAdmin: null, isFetching: true } );

		const result = renderFlow( staticSiteImportFlow ).runUseAssertionCondition( {
			currentStep: STEPS.STATIC_SITE_IMPORT_READING.slug,
			currentURL: `${ readingPath }?siteId=42`,
		} );

		expect( result.state ).toBe( AssertConditionState.CHECKING );
	} );

	describe( 'initialize', () => {
		it( 'sends unsupported sources to the migration flow to be identified', () => {
			window.location.search = '?from=example.com&platform=wordpress&siteId=42';

			expect( staticSiteImportFlow.initialize() ).toBe( false );
			expect( window.location.replace ).toHaveBeenCalledWith(
				`${ identifyPath }?from=example.com&platform=wordpress&siteId=42`
			);
		} );

		it( 'sends every source there when the flag is off', () => {
			config.disable( 'migration/non-wordpress-source' );
			window.location.search = '?from=example.com&platform=wix';

			expect( staticSiteImportFlow.initialize() ).toBe( false );
			expect( window.location.replace ).toHaveBeenCalledWith(
				`${ identifyPath }?from=example.com&platform=wix`
			);
		} );

		it.each( [
			[ readingPath, plansPath ],
			[ `${ readingPath }/es`, `${ plansPath }/es` ],
		] )(
			'sends reading links without a destination to plans before authentication (%s)',
			( path, expectedPlansPath ) => {
				window.location.pathname = path;
				window.location.search = '?from=example.com&platform=wix';

				expect( staticSiteImportFlow.initialize() ).toBe( false );
				expect( window.location.replace ).toHaveBeenCalledWith(
					`${ expectedPlansPath }?from=example.com&platform=wix`
				);
			}
		);
	} );

	describe( 'authentication', () => {
		beforeEach( () => {
			jest.mocked( isUserLoggedIn ).mockReturnValue( false );
			window.location.search = `?${ new URLSearchParams( SOURCE ) }`;
		} );

		const renderStep = ( slug: string ) => {
			const steps = staticSiteImportFlow.initialize();
			const step = steps && steps.find( ( step ) => step.slug === slug );
			const navigate = jest.fn();
			renderWithProvider(
				<MemoryRouter initialEntries={ [ `/static-site-import/${ slug }` ] }>
					<StepRoute
						step={ step }
						flow={ staticSiteImportFlow }
						renderStep={ () => <div>Import step</div> }
						navigate={ navigate }
					/>
				</MemoryRouter>
			);
			return navigate;
		};

		it( 'lets signed-out visitors choose a plan for a new site', () => {
			const navigate = renderStep( STEPS.UNIFIED_PLANS.slug );

			expect( screen.getByText( 'Import step' ) ).toBeVisible();
			expect( navigate ).not.toHaveBeenCalled();
		} );

		it.each( [ STEPS.UNIFIED_PLANS, STEPS.STATIC_SITE_IMPORT_READING ] )(
			'requires authentication for $slug with an existing destination',
			( step ) => {
				window.location.search += '&siteId=42';
				const navigate = renderStep( step.slug );

				expect( screen.queryByText( 'Import step' ) ).not.toBeInTheDocument();
				expect( navigate ).toHaveBeenCalledWith(
					'user',
					expect.objectContaining( { nextStep: step.slug } ),
					true
				);
			}
		);
	} );

	describe( 'reading after checkout', () => {
		it( 'resolves the receipt site ID and sends the started session to its overview', () => {
			jest.mocked( useSite ).mockReturnValue( PAID_SITE );

			runNavigation( {
				from: STEPS.STATIC_SITE_IMPORT_READING,
				dependencies: { action: 'continue', importSessionId: 'abc123' },
				query: { ...SOURCE, siteId: SITE.siteId },
			} );

			expect( lastExit() ).toMatchObject( {
				path: expect.stringMatching( new RegExp( `/sites/${ SITE.siteSlug }$` ) ),
				query: { ...SOURCE, importSessionId: 'abc123', ref: 'static-site-import' },
			} );
		} );

		it( 'requires an upgrade before continuing an old session for a free site', () => {
			const destination = runNavigation( {
				from: STEPS.STATIC_SITE_IMPORT_READING,
				dependencies: { action: 'continue', importSessionId: 'abc123' },
				query: { ...SOURCE, ...SITE },
			} );

			expect( destination ).toMatchDestination( {
				step: STEPS.UNIFIED_PLANS,
				query: { importSessionId: 'abc123' },
			} );
		} );

		it( 'falls back to the content importer when the session cannot start', () => {
			runNavigation( {
				from: STEPS.STATIC_SITE_IMPORT_READING,
				dependencies: { action: 'unavailable' },
				query: { ...SOURCE, ...SITE },
			} );

			expect( lastExit() ).toMatchObject( {
				path: '/setup/site-setup/importerWix',
				query: { from: SOURCE.from, siteSlug: SITE.siteSlug },
			} );
		} );
	} );

	it.each( [ STEPS.UNIFIED_PLANS, STEPS.STATIC_SITE_IMPORT_READING ] )(
		'goes back from $slug to source identification with the destination retained',
		( step ) => {
			runFlowNavigation(
				staticSiteImportFlow,
				{ from: step, query: { ...SOURCE, ...SITE } },
				'back'
			);

			expect( lastExit() ).toEqual( {
				path: identifyPath,
				query: { from: SOURCE.from, siteId: '42', siteSlug: SITE.siteSlug },
			} );
		}
	);

	it( 'preserves the selected locale when going back to source identification', () => {
		jest.mocked( useFlowLocale ).mockReturnValue( 'es' );
		runFlowNavigation(
			staticSiteImportFlow,
			{ from: STEPS.UNIFIED_PLANS, query: { ...SOURCE } },
			'back'
		);

		expect( lastExit() ).toEqual( {
			path: `${ identifyPath }/es`,
			query: { from: SOURCE.from },
		} );
	} );

	describe( 'choosing a plan', () => {
		it.each( [ false, true ] )(
			'uses unified checkout and applies site settings for a new destination (logged in: %s)',
			( userIsLoggedIn ) => {
				jest.mocked( isUserLoggedIn ).mockReturnValue( userIsLoggedIn );
				// A previous signup must not turn this into an upgrade of another site.
				jest.mocked( useSite ).mockReturnValue( PAID_SITE );
				const query = { ...SOURCE, coupon: 'TEST', ref: 'move', source: 'landing-page' };
				runNavigation( { from: STEPS.UNIFIED_PLANS, dependencies: PLAN, query } );

				expect( goToCheckout ).not.toHaveBeenCalled();
				expect( goToUnifiedCheckout ).toHaveBeenCalledWith(
					expect.objectContaining( {
						flowName: 'static-site-import',
						plan: 'business-bundle',
						userIsLoggedIn,
						siteIntent: 'site-migration',
						extraQueryParams: expect.objectContaining( {
							lang: 'en',
							coupon: 'TEST',
							ref: 'move',
							source: 'landing-page',
							checkoutBackUrl: expect.stringContaining( `${ plansPath }?` ),
						} ),
					} )
				);
				const { destination, cancelDestination } =
					jest.mocked( goToUnifiedCheckout ).mock.calls[ 0 ][ 0 ];
				expect( parseUrl( destination ) ).toEqual( {
					path: readingPath,
					query: {
						...query,
						applySiteSettings: '1',
						siteId: ':siteId',
					},
				} );
				expect( destination ).toContain( '&siteId=:siteId' );
				expect( parseUrl( cancelDestination ) ).toEqual( { path: plansPath, query } );
			}
		);

		it( 'preserves the selected locale in the checkout return paths', () => {
			jest.mocked( useFlowLocale ).mockReturnValue( 'es' );
			const query = { ...SOURCE, coupon: 'TEST' };
			runNavigation( { from: STEPS.UNIFIED_PLANS, dependencies: PLAN, query } );

			const { destination, cancelDestination, extraQueryParams } =
				jest.mocked( goToUnifiedCheckout ).mock.calls[ 0 ][ 0 ];
			expect( parseUrl( destination ).path ).toBe( `${ readingPath }/es` );
			expect( parseUrl( cancelDestination ) ).toEqual( {
				path: `${ plansPath }/es`,
				query,
			} );

			const checkoutBackUrl = new URL( extraQueryParams?.checkoutBackUrl ?? '' );
			expect( extraQueryParams?.lang ).toBe( 'es' );
			expect( parseUrl( destination ).query.applySiteSettings ).toBe( '1' );
			expect( checkoutBackUrl.pathname ).toBe( `${ plansPath }/es` );
			expect( Object.fromEntries( checkoutBackUrl.searchParams ) ).toEqual( query );
		} );

		it( 'uses site checkout for an existing free destination and returns to start the session', () => {
			runNavigation( {
				from: STEPS.UNIFIED_PLANS,
				dependencies: PLAN,
				query: { ...SOURCE, ...SITE },
			} );

			expect( goToUnifiedCheckout ).not.toHaveBeenCalled();
			const { destination, cancelDestination, siteSlug, plan } =
				jest.mocked( goToCheckout ).mock.calls[ 0 ][ 0 ];
			expect( siteSlug ).toBe( SITE.siteSlug );
			expect( plan ).toBe( 'business-bundle' );
			expect( parseUrl( destination ) ).toEqual( {
				path: readingPath,
				query: { ...SOURCE, siteId: '42', siteSlug: SITE.siteSlug },
			} );
			expect( parseUrl( cancelDestination ) ).toEqual( {
				path: plansPath,
				query: { ...SOURCE, siteId: '42', siteSlug: SITE.siteSlug },
			} );
		} );

		it( 'skips plans and checkout for an existing paid destination', () => {
			jest.mocked( useSite ).mockReturnValue( PAID_SITE );
			const navigate = jest.fn();
			renderHookWithProvider(
				() => staticSiteImportFlow.useStepNavigation( STEPS.UNIFIED_PLANS.slug, navigate ),
				{
					wrapper: ( { children } ) => (
						<MemoryRouter initialEntries={ [ `${ plansPath }?siteId=42` ] }>
							{ children }
						</MemoryRouter>
					),
				}
			);

			expect( navigate ).toHaveBeenCalledWith(
				STEPS.STATIC_SITE_IMPORT_READING.slug,
				undefined,
				true
			);
			expect( goToCheckout ).not.toHaveBeenCalled();
			expect( goToUnifiedCheckout ).not.toHaveBeenCalled();
		} );

		it( 'shows an error when no plan is selected', () => {
			const destination = runNavigation( { from: STEPS.UNIFIED_PLANS, query: SOURCE } );

			expect( destination ).toMatchDestination( { step: STEPS.ERROR, query: null } );
			expect( getFlowLocation().state ).toEqual( { errorReason: 'no_plan_selected' } );
			expect( goToUnifiedCheckout ).not.toHaveBeenCalled();
		} );
	} );
} );
