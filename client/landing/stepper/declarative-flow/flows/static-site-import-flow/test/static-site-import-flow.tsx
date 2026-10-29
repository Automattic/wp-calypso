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

const saveCreatedSite = () => {
	setSignupCompleteFlowName( 'static-site-import' );
	setSignupCompleteSiteID( '42' );
	persistSignupDestination( `${ readingPath }?${ new URLSearchParams( SOURCE ) }&siteId=:siteId` );
};

const renderPlansNavigation = ( url: string ) => {
	const navigate = jest.fn();
	renderHookWithProvider(
		() => staticSiteImportFlow.useStepNavigation( STEPS.UNIFIED_PLANS.slug, navigate ),
		{
			wrapper: ( { children } ) => (
				<MemoryRouter initialEntries={ [ url ] }>{ children }</MemoryRouter>
			),
		}
	);
	return navigate;
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

	describe( 'destination checks', () => {
		it( 'sends users who cannot manage the destination site to the start page', () => {
			jest.mocked( useIsSiteAdmin ).mockReturnValue( { isAdmin: false, isFetching: false } );

			renderFlow( staticSiteImportFlow ).runUseAssertionCondition( {
				currentStep: STEPS.STATIC_SITE_IMPORT_READING.slug,
				currentURL: `${ readingPath }?siteId=42`,
			} );

			expect( window.location.assign ).toHaveBeenCalledWith( '/start' );
		} );

		it.each( [
			[ `${ plansPath }?${ new URLSearchParams( SOURCE ) }`, AssertConditionState.SUCCESS ],
			[ `${ readingPath }?siteId=42`, AssertConditionState.CHECKING ],
		] )( 'waits for the destination site only when the URL names one (%s)', ( url, state ) => {
			jest.mocked( useIsSiteAdmin ).mockReturnValue( { isAdmin: null, isFetching: true } );

			const result = renderFlow( staticSiteImportFlow ).runUseAssertionCondition( {
				currentStep: STEPS.UNIFIED_PLANS.slug,
				currentURL: url,
			} );

			expect( result.state ).toBe( state );
			expect( window.location.assign ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'choosing a plan', () => {
		it.each( [
			{ locale: 'en', suffix: '' },
			{ locale: 'es', suffix: '/es' },
		] )(
			'uses unified checkout for a new destination and returns to reading ($locale)',
			( { locale, suffix } ) => {
				jest.mocked( useFlowLocale ).mockReturnValue( locale );
				jest.mocked( isUserLoggedIn ).mockReturnValue( false );
				// A previous signup must not turn this into an upgrade of another site.
				jest.mocked( useSite ).mockReturnValue( PAID_SITE );
				const query = { ...SOURCE, coupon: 'TEST' };
				runNavigation( { from: STEPS.UNIFIED_PLANS, dependencies: PLAN, query } );

				expect( goToCheckout ).not.toHaveBeenCalled();
				const { destination, cancelDestination, ...options } =
					jest.mocked( goToUnifiedCheckout ).mock.calls[ 0 ][ 0 ];
				expect( options ).toEqual( {
					flowName: 'static-site-import',
					plan: 'business-bundle',
					userIsLoggedIn: false,
					siteIntent: 'site-migration',
				} );
				expect( destination ).toContain( '&siteId=:siteId' );
				expect( parseUrl( destination ) ).toEqual( {
					path: `${ readingPath }${ suffix }`,
					query: { ...query, newSite: '1', siteId: ':siteId' },
				} );
				expect( parseUrl( cancelDestination ) ).toEqual( {
					path: `${ plansPath }${ suffix }`,
					query,
				} );
			}
		);

		it.each( [
			{ createdSite: false, newSite: undefined },
			{ createdSite: true, newSite: '1' },
		] )(
			'uses site checkout for an existing free destination (created by this flow: $createdSite)',
			( { createdSite, newSite } ) => {
				if ( createdSite ) {
					saveCreatedSite();
				}
				const query = { ...SOURCE, ...SITE };
				runNavigation( { from: STEPS.UNIFIED_PLANS, dependencies: PLAN, query } );

				expect( goToUnifiedCheckout ).not.toHaveBeenCalled();
				const { destination, cancelDestination, siteSlug, plan } =
					jest.mocked( goToCheckout ).mock.calls[ 0 ][ 0 ];
				expect( siteSlug ).toBe( SITE.siteSlug );
				expect( plan ).toBe( 'business-bundle' );
				expect( parseUrl( destination ) ).toEqual( {
					path: readingPath,
					query: { ...query, siteId: '42', ...( newSite && { newSite } ) },
				} );
				expect( parseUrl( cancelDestination ) ).toEqual( {
					path: plansPath,
					query: { ...query, siteId: '42' },
				} );
			}
		);

		it( 'skips plans and checkout for an existing paid destination', () => {
			jest.mocked( useSite ).mockReturnValue( PAID_SITE );

			const navigate = renderPlansNavigation( `${ plansPath }?siteId=42` );

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

	describe( 'back on plans after leaving checkout', () => {
		const plansUrl = `${ plansPath }/es?${ new URLSearchParams( SOURCE ) }`;

		it( 'retries against the site unified checkout created', () => {
			window.location.href = `https://example.com${ plansUrl }`;
			saveCreatedSite();

			renderPlansNavigation( plansUrl );

			expect( window.location.replace ).toHaveBeenCalledWith(
				`${ window.location.href }&siteId=42`
			);
		} );

		it( 'also does so when the browser restores the page from its cache', () => {
			window.location.href = `https://example.com${ plansUrl }`;
			renderPlansNavigation( plansUrl );
			expect( window.location.replace ).not.toHaveBeenCalled();

			saveCreatedSite();
			act( () =>
				window.dispatchEvent( new PageTransitionEvent( 'pageshow', { persisted: true } ) )
			);

			expect( window.location.replace ).toHaveBeenCalledWith(
				`${ window.location.href }&siteId=42`
			);
		} );

		it.each( [
			{ flow: 'onboarding', source: SOURCE, query: SOURCE },
			{
				flow: 'static-site-import',
				source: { ...SOURCE, from: 'another.example.com' },
				query: SOURCE,
			},
			{ flow: 'static-site-import', source: SOURCE, query: { ...SOURCE, siteId: 99 } },
		] )( 'ignores a site created for an unrelated checkout: %j', ( { flow, source, query } ) => {
			setSignupCompleteFlowName( flow );
			setSignupCompleteSiteID( '42' );
			persistSignupDestination(
				`${ readingPath }?${ new URLSearchParams( source ) }&siteId=:siteId`
			);
			runNavigation( { from: STEPS.UNIFIED_PLANS, dependencies: PLAN, query } );
			expect( window.location.replace ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'reading', () => {
		it( 'sends the started session to the paid destination’s overview', () => {
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

	it.each( [
		{ step: STEPS.UNIFIED_PLANS, locale: 'en', query: { ...SOURCE, ...SITE } },
		{ step: STEPS.STATIC_SITE_IMPORT_READING, locale: 'es', query: SOURCE },
	] )(
		'goes back from $step.slug to source identification with the destination retained ($locale)',
		( { step, locale, query } ) => {
			jest.mocked( useFlowLocale ).mockReturnValue( locale );
			runFlowNavigation( staticSiteImportFlow, { from: step, query }, 'back' );

			expect( lastExit() ).toEqual( {
				path: locale === 'en' ? identifyPath : `${ identifyPath }/${ locale }`,
				query: {
					from: SOURCE.from,
					...( query.siteId && { siteId: String( query.siteId ), siteSlug: query.siteSlug } ),
				},
			} );
		}
	);
} );
