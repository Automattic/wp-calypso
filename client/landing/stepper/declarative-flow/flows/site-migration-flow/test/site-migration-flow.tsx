/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import config from '@automattic/calypso-config';
import { PLAN_BUSINESS_MONTHLY } from '@automattic/calypso-products';
import { isCurrentUserLoggedIn } from '@automattic/data-stores/src/user/selectors';
import { QueryClient, useQueryClient } from '@tanstack/react-query';
import { act, waitFor } from '@testing-library/react';
import { dispatch, select } from '@wordpress/data';
import nock from 'nock';
import { MemoryRouter, useLocation, useNavigate, useNavigationType } from 'react-router';
import { dashboardLink } from 'calypso/dashboard/utils/link';
import { HOW_TO_MIGRATE_OPTIONS } from 'calypso/landing/stepper/constants';
import { useFlowNavigation } from 'calypso/landing/stepper/declarative-flow/internals/hooks/use-flow-navigation';
import { useStepNavigationWithTracking } from 'calypso/landing/stepper/declarative-flow/internals/hooks/use-step-navigation-with-tracking';
import { useFlowState } from 'calypso/landing/stepper/declarative-flow/internals/state-manager/store';
import { STEPS } from 'calypso/landing/stepper/declarative-flow/internals/steps';
import { ProcessingResult } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/processing-step/constants';
import {
	getAssertionConditionResult,
	getFlowLocation,
	renderFlow,
	runFlowNavigation,
} from 'calypso/landing/stepper/declarative-flow/test/helpers';
import { useIsSiteAdmin } from 'calypso/landing/stepper/hooks/use-is-site-admin';
import { useSiteQuery } from 'calypso/landing/stepper/hooks/use-site';
import { useSiteCopy } from 'calypso/landing/stepper/hooks/use-site-copy';
import * as siteData from 'calypso/landing/stepper/hooks/use-site-data';
import { ONBOARD_STORE, SITE_STORE } from 'calypso/landing/stepper/stores';
import { goToCheckout } from 'calypso/landing/stepper/utils/checkout';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { leaveCheckout } from 'calypso/my-sites/checkout/src/lib/leave-checkout';
import { getCurrentUserId, getCurrentUserSiteCount } from 'calypso/state/current-user/selectors';
import getSiteOption from 'calypso/state/sites/selectors/get-site-option';
import { renderHookWithProvider } from 'calypso/test-helpers/testing-library';
import { useRecordSignupComplete } from '../../../../hooks/use-record-signup-complete';
import siteMigrationFlow from '../site-migration-flow';
import type { ReactNode } from 'react';
// we need to save the original object for later to not affect tests from other files
const originalLocation = window.location;

jest.mock( '@tanstack/react-query', () => ( {
	...jest.requireActual( '@tanstack/react-query' ),
	useQueryClient: jest.fn( jest.requireActual( '@tanstack/react-query' ).useQueryClient ),
} ) );
jest.mock( 'calypso/landing/stepper/utils/checkout' );
jest.mock( 'calypso/lib/analytics/tracks', () => ( {
	...jest.requireActual( 'calypso/lib/analytics/tracks' ),
	recordTracksEvent: jest.fn(),
} ) );
jest.mock( '@automattic/data-stores/src/user/selectors' );
jest.mock( 'calypso/state/current-user/selectors' );
jest.mock( 'calypso/landing/stepper/hooks/use-is-site-admin' );
jest.mock( 'calypso/landing/stepper/hooks/use-site', () => ( {
	...jest.requireActual( 'calypso/landing/stepper/hooks/use-site' ),
	useSiteQuery: jest.fn(),
} ) );
jest.mock( 'calypso/landing/stepper/hooks/use-site-copy' );
jest.mock( 'calypso/lib/guides/trigger-guides-for-step', () => ( {
	triggerGuidesForStep: jest.fn(),
} ) );

jest.mock( 'calypso/landing/stepper/declarative-flow/internals/state-manager/store', () => ( {
	useFlowState: jest.fn().mockReturnValue( {
		get: jest.fn(),
		set: jest.fn(),
		sessionId: '123',
		queryKey: [ 'stepper-state-item', 'site-migration', '123', 'v1' ],
	} ),
} ) );

jest.mock( 'calypso/state/sites/selectors/get-site-option' );
jest.mock( 'calypso/landing/stepper/hooks/use-record-signup-complete', () => ( {
	useRecordSignupComplete: jest.fn().mockReturnValue( jest.fn() ),
} ) );

const runNavigation = ( options: Parameters< typeof runFlowNavigation >[ 1 ] ) =>
	runFlowNavigation( siteMigrationFlow, options, 'forward' );

const renderNavigation = ( initialEntries: string[], initialIndex = 0 ) =>
	renderHookWithProvider(
		() => {
			const location = useLocation();
			const navigateHistory = useNavigate();
			window.location.search = location.search;
			const { navigate, params } = useFlowNavigation( siteMigrationFlow );
			const navigation = useStepNavigationWithTracking( {
				flow: siteMigrationFlow,
				currentStepRoute: params.step,
				navigate,
			} );
			return {
				navigation,
				location,
				navigationType: useNavigationType(),
				back: () => navigateHistory( -1 ),
			};
		},
		{
			wrapper: ( { children } ) => (
				<MemoryRouter
					basename="/setup"
					initialEntries={ initialEntries }
					initialIndex={ initialIndex }
				>
					{ children }
				</MemoryRouter>
			),
		}
	);

describe( 'Site Migration Flow', () => {
	beforeAll( () => {
		Object.defineProperty( window, 'location', {
			value: { ...originalLocation, assign: jest.fn(), replace: jest.fn() },
		} );
	} );

	afterAll( () => {
		Object.defineProperty( window, 'location', originalLocation );
	} );

	beforeEach( () => {
		jest
			.mocked( useQueryClient )
			.mockImplementation( jest.requireActual( '@tanstack/react-query' ).useQueryClient );
		// These cases cover the flag-off path for non-WordPress sources. The hand-off to the
		// static-site import flow has its own cases below and enables the flag itself.
		config.disable( 'migration/non-wordpress-source' );
		( window.location.assign as jest.Mock ).mockClear();
		( window.location.replace as jest.Mock ).mockClear();
		( isCurrentUserLoggedIn as jest.Mock ).mockReturnValue( true );
		( useIsSiteAdmin as jest.Mock ).mockReturnValue( {
			isAdmin: true,
		} );
		( getSiteOption as jest.Mock ).mockReturnValue( 'https://example.wpcomstaging.com/wp-admin/' );
		jest.mocked( getCurrentUserSiteCount ).mockReturnValue( 0 );
		jest.mocked( useSiteQuery ).mockReturnValue( {
			data: null,
			isLoading: false,
			isError: false,
			refetch: jest.fn(),
		} );
		jest.mocked( useSiteCopy ).mockReturnValue( {
			shouldShowSiteCopyItem: false,
			isFetching: false,
			startSiteCopy: jest.fn(),
		} );
		jest.mocked( useFlowState().get ).mockReturnValue( undefined );

		const apiBaseUrl = 'https://public-api.wordpress.com';
		const testSettingsEndpoint = '/rest/v1.4/sites/example.wordpress.com/settings';
		nock( apiBaseUrl ).get( testSettingsEndpoint ).reply( 200, {} );
		nock( apiBaseUrl ).post( testSettingsEndpoint ).reply( 200, {} );
		nock( apiBaseUrl ).post( '/wpcom/v2/guides/trigger' ).reply( 200, {} );
	} );

	describe( 'browser-history Back navigation', () => {
		afterEach( () => {
			window.location.search = '';
		} );

		it.each( [ 'wordpress', 'squarespace' ] )(
			'keeps the failed address through platform selection, Back and creation for %s',
			( platform ) => {
				jest.spyOn( config, 'isEnabled' ).mockReturnValue( true );
				jest.spyOn( window.history, 'length', 'get' ).mockReturnValue( 2 );
				const { result } = renderNavigation( [
					'/setup/site-migration/site-migration-identify?source=sites-dashboard&ref=new-site-popover&sessionId=escape&host=bluehost&ssh=true&isWpcom=true',
				] );
				const escape = {
					action: 'skip_platform_identification',
					from: 'https://unreachable.example.com',
				};
				act( () => result.current.navigation.submit( escape ) );
				expect( result.current.location.pathname ).toBe( '/site-migration/importList' );
				act( () => result.current.navigation.goBack() );
				expect( result.current.location.pathname ).toBe(
					'/site-migration/site-migration-identify'
				);
				expect( new URLSearchParams( result.current.location.search ).get( 'from' ) ).toBe(
					escape.from
				);
				act( () => result.current.navigation.submit( escape ) );
				act( () => result.current.navigation.submit( { platform } ) );
				expect( result.current.location.pathname ).toBe( '/site-migration/create-site' );
				const query = new URLSearchParams( result.current.location.search );
				expect( query.get( 'from' ) ).toBe( escape.from );
				expect( query.get( 'sessionId' ) ).toBe( 'escape' );
				for ( const key of [ 'host', 'ssh', 'isWpcom' ] ) {
					expect( query.get( key ) ).toBe( '' );
				}
				act( () => result.current.navigation.goBack() );
				expect( result.current.location.pathname ).toBe( '/site-migration/importList' );
				act( () => result.current.navigation.submit( { platform } ) );
				act( () => result.current.navigation.submit( {} ) );
				act( () =>
					result.current.navigation.submit( {
						siteCreated: true,
						siteId: 123,
						siteSlug: 'destination.wordpress.com',
					} )
				);
				const destination = new URL(
					window.location.replace.mock.lastCall?.[ 0 ] ||
						`${ result.current.location.pathname }${ result.current.location.search }`,
					'https://example.com'
				);
				expect( destination.pathname ).toBe(
					platform === 'wordpress'
						? '/site-migration/site-migration-how-to-migrate'
						: '/setup/site-setup/importerSquarespace'
				);
				expect( destination.searchParams.get( 'from' ) ).toBe( escape.from );
				expect( window.location.assign ).not.toHaveBeenCalled();
				expect( goToCheckout ).not.toHaveBeenCalled();
			}
		);

		it.each( [ 0, 2 ] )(
			'opens platforms before the destination and supports Back with %s sites',
			( siteCount ) => {
				jest.spyOn( config, 'isEnabled' ).mockReturnValue( true );
				jest.spyOn( window.history, 'length', 'get' ).mockReturnValue( 2 );
				jest.mocked( getCurrentUserSiteCount ).mockReturnValue( siteCount );
				const context = new URLSearchParams( {
					from: 'https://old.example.com',
					platform: 'wordpress',
					host: 'bluehost',
					isWpcom: 'false',
					ssh: 'true',
					action: 'migrate',
					how: HOW_TO_MIGRATE_OPTIONS.DO_IT_FOR_ME,
					source: 'sites-dashboard',
					ref: 'new-site-popover',
					sessionId: 'platform-escape',
					flags: 'migration/reprint-flow',
				} );
				const { result } = renderNavigation( [
					`/setup/site-migration/site-migration-identify?${ context }`,
				] );
				act( () => result.current.navigation.submit( { action: 'skip_platform_identification' } ) );
				expect( result.current.location.pathname ).toBe( '/site-migration/importList' );
				const query = new URLSearchParams( result.current.location.search );
				expect( query.get( 'platform' ) ).toBe( 'unknown' );
				for ( const key of [ 'from', 'host', 'isWpcom', 'ssh', 'action', 'how' ] ) {
					expect( query.get( key ) ).toBe( '' );
				}
				for ( const key of [ 'source', 'ref', 'sessionId', 'flags' ] ) {
					expect( query.get( key ) ).toBe( context.get( key ) );
				}
				act( () => result.current.navigation.submit( { platform: 'squarespace', url: 'unused' } ) );
				expect( result.current.location.pathname ).toBe(
					siteCount ? '/site-migration/sitePicker' : '/site-migration/create-site'
				);
				const destinationQuery = new URLSearchParams( result.current.location.search );
				expect( destinationQuery.get( 'platform' ) ).toBe( 'squarespace' );
				for ( const key of [ 'source', 'ref', 'sessionId', 'flags' ] ) {
					expect( destinationQuery.get( key ) ).toBe( context.get( key ) );
				}
				act( () => result.current.navigation.goBack() );
				expect( result.current.location.pathname ).toBe( '/site-migration/importList' );
				act( () => result.current.navigation.goBack() );
				expect( result.current.location.pathname ).toBe(
					'/site-migration/site-migration-identify'
				);
				expect( window.location.assign ).not.toHaveBeenCalled();
			}
		);

		it( 'clears the destination through real Stepper navigation and restores it with Back', () => {
			jest
				.spyOn( config, 'isEnabled' )
				.mockImplementation( ( flag ) => flag === 'migration/reprint-flow' );
			jest.spyOn( window.history, 'length', 'get' ).mockReturnValue( 2 );
			const context = new URLSearchParams( {
				from: 'https://wordpress.org/',
				platform: 'wordpress',
				host: 'automattic',
				isWpcom: 'false',
				siteId: '123',
				siteSlug: 'destination.wordpress.com',
				source: 'sites-dashboard',
				ref: 'new-site-popover',
				sessionId: 'different-site',
				flags: 'migration/reprint-flow',
			} );
			const { result } = renderNavigation( [
				`/setup/site-migration/site-migration-check?${ context }`,
			] );
			act( () =>
				result.current.navigation.submit( {
					action: 'select-existing-site',
					from: context.get( 'from' ),
					platform: 'wordpress',
					host: 'automattic',
				} )
			);
			expect( result.current.location.pathname ).toBe( '/site-migration/sitePicker' );
			const pickerQuery = new URLSearchParams( result.current.location.search );
			expect( pickerQuery.get( 'siteId' ) ).toBe( '' );
			expect( pickerQuery.get( 'siteSlug' ) ).toBe( '' );
			for ( const key of [ 'from', 'platform', 'host', 'source', 'ref', 'sessionId', 'flags' ] ) {
				expect( pickerQuery.get( key ) ).toBe( context.get( key ) );
			}
			act( () => result.current.navigation.goBack() );
			expect( result.current.location.pathname ).toBe( '/site-migration/site-migration-check' );
			expect( new URLSearchParams( result.current.location.search ).get( 'siteId' ) ).toBe( '123' );
			expect( new URLSearchParams( result.current.location.search ).get( 'siteSlug' ) ).toBe(
				'destination.wordpress.com'
			);
			expect( window.location.assign ).not.toHaveBeenCalled();
		} );

		it( 'returns through picker, plans, result, address and the entry page without a loop', () => {
			jest.mocked( getCurrentUserSiteCount ).mockReturnValue( 2 );
			jest
				.spyOn( config, 'isEnabled' )
				.mockImplementation( ( flag ) => flag === 'migration/reprint-flow' );
			jest.spyOn( window.history, 'length', 'get' ).mockReturnValue( 2 );
			const browserBack = jest.spyOn( window.history, 'back' ).mockImplementation( () => {} );
			const search =
				'?source=sites-dashboard&ref=new-site-popover&sessionId=abc&flags=migration%2Freprint-flow';
			const addressPath = '/site-migration/site-migration-identify';
			const { result } = renderNavigation(
				[ '/setup/previous-page', `/setup${ addressPath }${ search }` ],
				1
			);
			const source = {
				from: 'https://wordpress.org/',
				platform: 'wordpress',
				host: 'automattic',
				isWpcom: false,
			};
			act( () => result.current.navigation.submit( { action: 'continue', ...source } ) );
			expect( result.current.location.pathname ).toBe( '/site-migration/site-migration-check' );
			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_site_migration_hosting_detected',
				expect.objectContaining( { hosting_provider: 'automattic', redirected_to_ssh: false } )
			);
			act( () => result.current.navigation.submit( { action: 'continue', ...source } ) );
			expect( result.current.location.pathname ).toBe( '/site-migration/plans' );
			expect( Object.fromEntries( new URLSearchParams( result.current.location.search ) ) ).toEqual(
				expect.objectContaining( {
					...Object.fromEntries( new URLSearchParams( search ) ),
					...source,
					isWpcom: 'false',
				} )
			);
			act( () => result.current.navigation.submit( { action: 'select-existing-site' } ) );
			expect( result.current.location.pathname ).toBe( '/site-migration/sitePicker' );
			act( () =>
				result.current.navigation.submit( {
					action: 'select-site',
					site: { ID: 123, slug: 'destination.wordpress.com', plan: { features: { active: [] } } },
				} )
			);
			expect( result.current.location.pathname ).toBe( '/site-migration/site-migration-check' );
			expect( Object.fromEntries( new URLSearchParams( result.current.location.search ) ) ).toEqual(
				expect.objectContaining( {
					...source,
					isWpcom: 'false',
					siteSlug: 'destination.wordpress.com',
				} )
			);
			act( () => result.current.navigation.goBack() );
			expect( result.current.location.pathname ).toBe( '/site-migration/sitePicker' );
			expect( new URLSearchParams( result.current.location.search ).get( 'siteSlug' ) ).toBeFalsy();
			act( () => result.current.navigation.goBack() );
			expect( result.current.location.pathname ).toBe( '/site-migration/plans' );
			act( () => result.current.navigation.goBack() );
			expect( result.current.location.pathname ).toBe( '/site-migration/site-migration-check' );
			act( () => result.current.navigation.goBack() );
			expect( result.current.location.pathname ).toBe( addressPath );
			expect( result.current.location.search ).toBe( search );
			act( () => result.current.navigation.goBack() );
			expect( result.current.location.pathname ).toBe( '/previous-page' );
			expect( browserBack ).not.toHaveBeenCalled();
		} );

		it( 'replaces a direct result entry with address entry when there is no history', () => {
			jest.spyOn( config, 'isEnabled' ).mockReturnValue( true );
			jest.spyOn( window.history, 'length', 'get' ).mockReturnValue( 1 );
			const search = '?from=https%3A%2F%2Fwordpress.org%2F&platform=wordpress&sessionId=abc';
			window.location.search = search;
			const { result } = renderNavigation( [
				`/setup/site-migration/site-migration-check${ search }`,
			] );
			act( () => result.current.navigation.submit( { action: 'back' } ) );
			expect( result.current.location.pathname ).toBe( '/site-migration/site-migration-identify' );
			expect( new URLSearchParams( result.current.location.search ).get( 'sessionId' ) ).toBe(
				'abc'
			);
			expect( result.current.navigationType ).toBe( 'REPLACE' );
		} );

		it( 'keeps address Back delegated to Stepper when the flag is off', () => {
			jest.spyOn( config, 'isEnabled' ).mockReturnValue( false );
			jest.spyOn( window.history, 'length', 'get' ).mockReturnValue( 2 );
			const { result } = renderHookWithProvider(
				() => siteMigrationFlow.useStepNavigation( STEPS.SITE_MIGRATION_IDENTIFY.slug, jest.fn() ),
				{ wrapper: MemoryRouter }
			);
			expect( result.current.goBack ).toBeUndefined();
		} );
	} );

	afterEach( () => {
		// Restore the original implementation after each test
		jest.restoreAllMocks();
	} );

	describe( 'initialize', () => {
		afterEach( () => {
			Object.assign( window.location, { pathname: '/', search: '', hash: '' } );
		} );

		it( 'redirects direct plans entry without the flag, preserving context', () => {
			jest.spyOn( config, 'isEnabled' ).mockReturnValue( false );
			const search =
				'?from=https%3A%2F%2Fexample.com&platform=wordpress&ref=new-site-popover&sessionId=abc';
			Object.assign( window.location, {
				pathname: '/setup/site-migration/plans',
				search,
				hash: '#test',
			} );
			expect( siteMigrationFlow.initialize() ).toBe( false );
			expect( window.location.replace ).toHaveBeenCalledWith(
				`/setup/site-migration/site-migration-identify${ search }#test`
			);
		} );

		describe( 'landing page site picker entry', () => {
			const landingPageSearch =
				'?from=https%3A%2F%2Fexample.com&ref=move-lp&start=true&platform=wordpress';
			let replaceState: jest.SpyInstance;

			beforeEach( () => {
				replaceState = jest.spyOn( window.history, 'replaceState' ).mockImplementation( () => {} );
			} );

			it( 'rewrites WordPress sources to the site checks in place with the flag', () => {
				jest
					.spyOn( config, 'isEnabled' )
					.mockImplementation( ( flag ) => flag === 'migration/reprint-flow' );
				Object.assign( window.location, {
					pathname: '/setup/site-migration/sitePicker',
					search: landingPageSearch,
				} );

				expect( siteMigrationFlow.initialize() ).not.toBe( false );
				expect( replaceState ).toHaveBeenCalledWith(
					null,
					'',
					`/setup/site-migration/site-migration-identify${ landingPageSearch }`
				);
				expect( window.location.replace ).not.toHaveBeenCalled();
			} );

			it.each( [
				[ 'the flag is off', false, landingPageSearch ],
				[ 'it is not a landing page entry', true, landingPageSearch.replace( '&start=true', '' ) ],
				[
					'the source is not WordPress',
					true,
					landingPageSearch.replace( 'wordpress', 'blogger' ),
				],
				[ 'the flow is already under way', true, `${ landingPageSearch }&sessionId=abc` ],
			] )( 'keeps the site picker when %s', ( _, flagEnabled, search ) => {
				jest
					.spyOn( config, 'isEnabled' )
					.mockImplementation( ( flag ) => flagEnabled && flag === 'migration/reprint-flow' );
				Object.assign( window.location, { pathname: '/setup/site-migration/sitePicker', search } );

				expect( siteMigrationFlow.initialize() ).not.toBe( false );
				expect( replaceState ).not.toHaveBeenCalled();
			} );
		} );

		it.each( [ '', '/', '/pt-br', '/pt-br/' ] )(
			'redirects the legacy choice URL with suffix "%s" while preserving context',
			( suffix ) => {
				const search =
					'?siteSlug=example.wordpress.com&siteId=123&from=https%3A%2F%2Fsource.com&ref=move-lp&sessionId=abc';
				Object.assign( window.location, {
					pathname: `/setup/site-migration/site-migration-import-or-migrate${ suffix }`,
					search,
					hash: '#migration',
				} );

				expect( siteMigrationFlow.initialize() ).toBe( false );
				expect( window.location.replace ).toHaveBeenCalledWith(
					`/setup/site-migration/site-migration-how-to-migrate${ suffix }${ search }#migration`
				);
			}
		);

		it( 'initializes the migration offer without redirecting', () => {
			window.location.pathname = '/setup/site-migration/site-migration-how-to-migrate';

			expect( siteMigrationFlow.initialize() ).not.toBe( false );
			expect( window.location.replace ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'isSignupFlow', () => {
		afterEach( () => {
			window.location.search = '';
		} );

		it( 'returns false when there is siteSlug on query params', () => {
			window.location.search = '?siteSlug=123';
			expect( siteMigrationFlow.isSignupFlow ).toBe( false );
		} );

		it( 'returns false when there is siteId on query params', () => {
			window.location.search = '?siteId=123';
			expect( siteMigrationFlow.isSignupFlow ).toBe( false );
		} );

		it( 'returns true when there is no siteSlug or siteId on query params', () => {
			window.location.search = '';
			expect( siteMigrationFlow.isSignupFlow ).toBe( true );
		} );
	} );

	describe( 'useAssertConditions', () => {
		it( 'redirects the user to the start page when the user is not a site admin', () => {
			const { runUseAssertionCondition } = renderFlow( siteMigrationFlow );
			( useIsSiteAdmin as jest.Mock ).mockReturnValue( { isAdmin: false } );

			runUseAssertionCondition( {
				currentStep: STEPS.SITE_MIGRATION_IDENTIFY.slug,
			} );

			expect( window.location.assign ).toHaveBeenCalledWith( '/start' );
		} );

		it( 'renders the step successfully', () => {
			const { runUseAssertionCondition } = renderFlow( siteMigrationFlow );

			runUseAssertionCondition( {
				currentStep: STEPS.SITE_MIGRATION_IDENTIFY.slug,
			} );

			expect( getAssertionConditionResult() ).toEqual( { state: 'success' } );
		} );
	} );

	describe( 'navigation', () => {
		beforeEach( () => {
			nock( 'https://public-api.wordpress.com' )
				.post( '/wpcom/v2/guides/trigger', {
					flow: 'site-migration',
					step: 'site-migration-identify',
				} )
				.reply( 200, { success: true } );
		} );

		describe( 'manual platform selection', () => {
			beforeEach( () => {
				jest
					.spyOn( config, 'isEnabled' )
					.mockImplementation( ( flag ) => flag === 'migration/reprint-flow' );
			} );

			it( 'opens the WordPress migration offer without a source address', () => {
				const destination = { siteId: 123, siteSlug: 'destination.wordpress.com' };
				const result = runNavigation( {
					from: STEPS.IMPORT_LIST,
					query: { ...destination, from: '', platform: 'unknown' },
					dependencies: { platform: 'wordpress', url: 'unused' },
				} );
				expect( result ).toMatchDestination( {
					step: STEPS.SITE_MIGRATION_HOW_TO_MIGRATE,
					query: {
						...destination,
						from: '',
						platform: 'wordpress',
						action: 'migrate',
						how: HOW_TO_MIGRATE_OPTIONS.DO_IT_FOR_ME,
					},
				} );
				expect( window.location.assign ).not.toHaveBeenCalled();
			} );

			it.each( [
				[ 'squarespace', '/setup/site-setup/importerSquarespace' ],
				[ 'ghost', 'https://destination.wordpress.com/wp-admin/admin.php' ],
			] )( 'opens the selected %s importer for a known destination', ( platform, path ) => {
				runNavigation( {
					from: STEPS.IMPORT_LIST,
					query: {
						from: '',
						platform: 'unknown',
						siteId: 123,
						siteSlug: 'destination.wordpress.com',
					},
					dependencies: { platform, url: 'https://untrusted.example.com' },
				} );
				expect( window.location.assign ).toMatchURL( { path } );
			} );

			it( 'keeps the selected platform through site creation and opens its importer', () => {
				const { result } = renderNavigation( [
					'/setup/site-migration/create-site?from=&platform=squarespace',
				] );
				act( () => result.current.navigation.submit( {} ) );
				expect( result.current.location.pathname ).toBe( '/site-migration/processing' );
				expect( new URLSearchParams( result.current.location.search ).get( 'platform' ) ).toBe(
					'squarespace'
				);
				act( () =>
					result.current.navigation.submit( {
						siteCreated: true,
						siteId: 123,
						siteSlug: 'destination.wordpress.com',
					} )
				);
				expect( window.location.replace ).toMatchURL( {
					path: '/setup/site-setup/importerSquarespace',
				} );
			} );

			it( 'checks a handed-over address once, then shows the form on return', () => {
				jest
					.spyOn( config, 'isEnabled' )
					.mockImplementation( ( flag ) => flag === 'migration/reprint-flow' );
				const state = jest.mocked( useFlowState )();
				let checked: boolean | undefined;
				jest
					.mocked( state.get )
					.mockImplementation( ( key ) =>
						key === 'migrationArrivalChecked' ? checked : undefined
					);
				const wrapper = ( { children }: { children: ReactNode } ) => (
					<MemoryRouter initialEntries={ [ '/?from=https://example.com&start=true' ] }>
						{ children }
					</MemoryRouter>
				);
				try {
					const { result: props, rerender } = renderHookWithProvider(
						() => siteMigrationFlow.useStepsProps(),
						{ wrapper }
					);
					expect( props.current[ STEPS.SITE_MIGRATION_IDENTIFY.slug ] ).toEqual( {
						checkOnArrival: true,
					} );

					const setQueryData = jest.spyOn( QueryClient.prototype, 'setQueryData' );
					runNavigation( {
						from: STEPS.SITE_MIGRATION_IDENTIFY,
						dependencies: { action: 'skip_platform_identification' },
					} );
					const arrivalWrite = setQueryData.mock.calls.find(
						( [ key ] ) => key === state.queryKey
					);
					expect( arrivalWrite ).toBeDefined();
					const updater = arrivalWrite?.[ 1 ] as ( previous: object ) => object;
					expect( updater( { flow: { entryPoint: 'move-lp' } } ) ).toEqual( {
						flow: { entryPoint: 'move-lp' },
						migrationArrivalChecked: true,
					} );

					checked = true;
					rerender();
					expect( props.current[ STEPS.SITE_MIGRATION_IDENTIFY.slug ] ).toEqual( {
						checkOnArrival: false,
					} );
				} finally {
					jest.mocked( state.get ).mockReset();
				}
			} );

			it( 'retains the destination-first escape when the flag is off', () => {
				jest.spyOn( config, 'isEnabled' ).mockReturnValue( false );
				jest.mocked( getCurrentUserSiteCount ).mockReturnValue( 2 );
				const result = runNavigation( {
					from: STEPS.SITE_MIGRATION_IDENTIFY,
					dependencies: { action: 'skip_platform_identification' },
				} );
				expect( result ).toMatchDestination( { step: STEPS.PICK_SITE } );
			} );
		} );

		describe( 'SITE_CREATION_STEP', () => {
			it( 'redirects to PROCESSING', () => {
				const destination = runNavigation( {
					from: STEPS.SITE_CREATION_STEP,
					query: {
						from: 'https://site-to-be-migrated.com',
						platform: 'wordpress',
						action: 'import',
					},
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.PROCESSING,
					query: {
						from: 'https://site-to-be-migrated.com',
						platform: 'wordpress',
						action: 'import',
					},
				} );
			} );
		} );

		describe( 'PROCESSING', () => {
			it.each( [
				[ ProcessingResult.SUCCESS, 'site_not_created' ],
				[ ProcessingResult.NO_ACTION, 'processing_no_action' ],
				[ ProcessingResult.FAILURE, 'processing_failed' ],
			] )(
				'names the cause when processing ends with %s and no site',
				( processingResult, errorReason ) => {
					const destination = runNavigation( {
						from: STEPS.PROCESSING,
						dependencies: { siteCreated: false, processingResult },
					} );

					expect( destination ).toMatchDestination( { step: STEPS.ERROR, query: null } );
					expect( getFlowLocation().state ).toEqual( {
						message: 'Site not created',
						errorReason,
					} );
				}
			);

			it( 'redirects to SITE_MIGRATION_HOW_TO_MIGRATE when the platform is wordpress', () => {
				const destination = runNavigation( {
					from: STEPS.PROCESSING,
					dependencies: {
						siteCreated: true,
						siteId: 123,
						siteSlug: 'example.wordpress.com',
					},
					query: {
						from: 'https://site-to-be-migrated.com',
						platform: 'wordpress',
					},
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.SITE_MIGRATION_HOW_TO_MIGRATE,
					query: {
						siteId: 123,
						siteSlug: 'example.wordpress.com',
						from: 'https://site-to-be-migrated.com',
					},
				} );
			} );

			it( 'replaces the processing history entry with the migration offer after site creation', () => {
				const navigate = jest.fn();
				const { result } = renderHookWithProvider(
					() => siteMigrationFlow.useStepNavigation( STEPS.PROCESSING.slug, navigate ),
					{
						wrapper: ( { children } ) => (
							<MemoryRouter
								initialEntries={ [
									'/processing?platform=wordpress&from=https%3A%2F%2Fsource.com&host=bluehost',
								] }
							>
								{ children }
							</MemoryRouter>
						),
					}
				);

				result.current.submit( {
					slug: STEPS.PROCESSING.slug,
					providedDependencies: {
						siteCreated: true,
						siteId: 123,
						siteSlug: 'example.wordpress.com',
					},
				} );

				expect( navigate ).toHaveBeenCalledWith(
					'site-migration-how-to-migrate?from=https%3A%2F%2Fsource.com&siteSlug=example.wordpress.com&siteId=123',
					undefined,
					true
				);
			} );

			it( 'redirects to HOW_TO_MIGRATE step if the platform when the query param action=migrate', () => {
				const destination = runNavigation( {
					from: STEPS.PROCESSING,
					dependencies: {
						siteCreated: true,
						siteId: 123,
						siteSlug: 'example.wordpress.com',
					},
					query: {
						from: 'https://site-to-be-migrated.com',
						action: 'migrate',
					},
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.SITE_MIGRATION_HOW_TO_MIGRATE,
					query: {
						siteId: 123,
						siteSlug: 'example.wordpress.com',
						from: 'https://site-to-be-migrated.com',
					},
				} );
			} );

			it( 'redirects to SITE_MIGRATION_UPGRADE_PLAN when the action=migrate and how=difm', () => {
				const destination = runNavigation( {
					from: STEPS.PROCESSING,
					dependencies: {
						siteCreated: true,
						siteId: 123,
						siteSlug: 'example.wordpress.com',
					},
					query: {
						from: 'https://site-to-be-migrated.com',
						platform: 'wordpress',
						how: HOW_TO_MIGRATE_OPTIONS.DO_IT_FOR_ME,
						action: 'migrate',
					},
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.SITE_MIGRATION_UPGRADE_PLAN,
					query: {
						siteId: 123,
						siteSlug: 'example.wordpress.com',
						from: 'https://site-to-be-migrated.com',
						how: HOW_TO_MIGRATE_OPTIONS.DO_IT_FOR_ME,
					},
				} );
			} );

			it( 'redirects to the import flow if there is no from query parameter', () => {
				runNavigation( {
					from: STEPS.PROCESSING,
					dependencies: {
						siteCreated: true,
						siteId: 123,
						siteSlug: 'example.wordpress.com',
					},
				} );

				expect( window.location.replace ).toMatchURL( {
					path: '/setup/site-setup/importList',
					query: {
						siteId: 123,
						siteSlug: 'example.wordpress.com',
						origin: STEPS.SITE_MIGRATION_IDENTIFY.slug,
						backToFlow: '/site-migration/site-migration-identify',
					},
				} );
			} );

			it( 'redirects to the proper importer when the platform is importable', () => {
				runNavigation( {
					from: STEPS.PROCESSING,
					dependencies: {
						siteCreated: true,
						siteId: 123,
						siteSlug: 'example.wordpress.com',
					},
					query: {
						platform: 'medium',
						from: 'https://example-to-be-migrated.com',
						sessionId: '123',
						siteId: 123,
					},
				} );

				expect( window.location.replace ).toMatchURL( {
					path: '/setup/site-setup/importerMedium',
					query: {
						from: 'https://example-to-be-migrated.com',
						siteSlug: 'example.wordpress.com',
						sessionId: '123',
					},
				} );
			} );

			it( 'records signup complete when the site is created', () => {
				const recordSignupComplete = jest.fn();
				jest.mocked( useRecordSignupComplete ).mockReturnValue( recordSignupComplete );

				runNavigation( {
					from: STEPS.PROCESSING,
					dependencies: { siteId: 123, siteCreated: true },
				} );

				expect( recordSignupComplete ).toHaveBeenCalledWith( { siteId: 123 } );
			} );
		} );

		describe( 'Reprint address routes', () => {
			it( 'initializes the source plan and marketplace purchases before opening the copy flow', async () => {
				jest.spyOn( config, 'isEnabled' ).mockReturnValue( true );
				const source = {
					ID: 456,
					site_owner: 789,
					URL: 'https://source.wordpress.com',
					plan: { product_slug: 'business-bundle' },
					options: { is_wpcom_atomic: true },
				};
				jest.spyOn( siteData, 'useSiteData' ).mockReturnValue( {
					siteId: 123,
					siteSlug: 'destination.wordpress.com',
					site: { plan: { product_slug: 'value_bundle' } },
				} );
				jest.mocked( useSiteQuery ).mockReturnValue( { data: source, isLoading: false } );
				jest.mocked( getCurrentUserId ).mockReturnValue( source.site_owner );
				jest
					.mocked( useSiteCopy )
					.mockImplementation(
						jest.requireActual( 'calypso/landing/stepper/hooks/use-site-copy' ).useSiteCopy
					);
				dispatch( SITE_STORE ).receiveSite( source.ID, source );
				dispatch( SITE_STORE ).finishResolution( 'getSite', [ source.ID ] );
				nock( 'https://public-api.wordpress.com' )
					.persist()
					.get( '/rest/v1.1/sites/456/features' )
					.reply( 200, { active: [ 'copy-site' ] } );
				nock( 'https://public-api.wordpress.com' )
					.get( '/rest/v1.2/upgrades' )
					.reply( 200, [
						{ blog_id: 456, product_type: 'marketplace_plugin', product_slug: 'source-plugin' },
						{ blog_id: 456, product_type: 'marketplace_theme', product_slug: 'source-theme' },
						{ blog_id: 123, product_type: 'marketplace_plugin', product_slug: 'other-site-plugin' },
						{ blog_id: 456, product_type: 'plan', product_slug: 'business-bundle' },
					] );
				let cartAtRedirect;
				jest.mocked( window.location.assign ).mockImplementationOnce( () => {
					cartAtRedirect = {
						plan: select( ONBOARD_STORE ).getPlanCartItem(),
						products: select( ONBOARD_STORE ).getProductCartItems(),
					};
				} );
				const { result } = renderHookWithProvider(
					() => {
						siteMigrationFlow.useSideEffect();
						return {
							props: siteMigrationFlow.useStepsProps(),
							navigation: siteMigrationFlow.useStepNavigation(
								STEPS.SITE_MIGRATION_CHECK.slug,
								jest.fn()
							),
						};
					},
					{
						wrapper: ( { children } ) => (
							<MemoryRouter
								initialEntries={ [
									'/setup/site-migration/site-migration-check?from=https://source.wordpress.com&platform=wordpress&isWpcom=true&siteSlug=destination.wordpress.com&siteId=123',
								] }
							>
								{ children }
							</MemoryRouter>
						),
					}
				);
				await waitFor( () =>
					expect(
						result.current.props[ STEPS.SITE_MIGRATION_CHECK.slug ].copySiteEligibility
					).toBe( 'eligible' )
				);
				act( () =>
					result.current.navigation.submit( {
						slug: STEPS.SITE_MIGRATION_CHECK.slug,
						providedDependencies: { action: 'copy-site', from: source.URL, platform: 'wordpress' },
					} )
				);
				expect( cartAtRedirect ).toEqual( {
					plan: { product_slug: 'business-bundle' },
					products: [ { product_slug: 'source-plugin' }, { product_slug: 'source-theme' } ],
				} );
				expect( window.location.assign ).toMatchURL( {
					path: '/setup/copy-site',
					query: { sourceSlug: 'source.wordpress.com' },
				} );
			} );

			it.each( [
				[ true, false, false, 'eligible' ],
				[ false, false, false, 'ineligible' ],
				[ true, true, false, 'loading' ],
				[ true, false, true, 'loading' ],
				[ false, true, false, 'loading' ],
				[ false, false, true, 'loading' ],
			] )(
				'checks copy eligibility on the source: eligible=%s, loading=%s, fetching=%s',
				( eligible, isLoading, isFetching, expected ) => {
					jest.spyOn( config, 'isEnabled' ).mockReturnValue( true );
					const source = { ID: 456, site_owner: 789 };
					jest.mocked( useSiteQuery ).mockReturnValue( { data: source, isLoading } );
					jest
						.mocked( useSiteCopy )
						.mockReturnValue( { shouldShowSiteCopyItem: eligible, isFetching } );
					const { result } = renderHookWithProvider( () => siteMigrationFlow.useStepsProps(), {
						wrapper: ( { children } ) => (
							<MemoryRouter
								initialEntries={ [
									'/setup/site-migration/site-migration-check?from=https://cotrim.dev/path&platform=wordpress&isWpcom=true&siteSlug=destination.wordpress.com',
								] }
							>
								{ children }
							</MemoryRouter>
						),
					} );
					expect( useSiteQuery ).toHaveBeenLastCalledWith( 'cotrim.dev', { enabled: true } );
					expect( useSiteCopy ).toHaveBeenLastCalledWith( source, { enabled: true } );
					expect( result.current[ STEPS.SITE_MIGRATION_CHECK.slug ].copySiteEligibility ).toBe(
						expected
					);
				}
			);

			it.each( [
				[ 'copy-site', '/setup/copy-site', { sourceSlug: 'cotrim.dev' } ],
				[ 'transfer-domain', '/setup/domain-transfer/intro', { new: 'cotrim.dev' } ],
				[ 'get-access', 'https://wordpress.com/support/account-recovery/', {} ],
			] )( 'opens the existing destination for %s', ( action, path, query ) => {
				jest.spyOn( config, 'isEnabled' ).mockReturnValue( true );
				runNavigation( {
					from: STEPS.SITE_MIGRATION_CHECK,
					query: {
						from: 'https://cotrim.dev/path',
						platform: 'wordpress',
						isWpcom: 'true',
						siteSlug: 'destination.wordpress.com',
						siteId: 123,
					},
					dependencies: { action, from: 'https://cotrim.dev/path', platform: 'wordpress' },
				} );
				expect( window.location.assign ).toMatchURL( { path, query } );
				expect( goToCheckout ).not.toHaveBeenCalled();
			} );

			it.each( [ 'wordpress', 'squarespace' ] )(
				'opens the existing %s path after manual selection for a supplied destination',
				( platform ) => {
					jest.spyOn( config, 'isEnabled' ).mockReturnValue( true );
					const result = runNavigation( {
						from: STEPS.IMPORT_LIST,
						dependencies: { platform },
						query: {
							from: 'https://unreachable.example.com',
							action: 'import',
							siteId: 123,
							siteSlug: 'destination.wordpress.com',
						},
					} );
					const destination = new URL(
						window.location.assign.mock.lastCall?.[ 0 ] || `/${ result.step }?${ result.query }`,
						'https://example.com'
					);
					expect( destination.pathname ).toBe(
						platform === 'wordpress'
							? '/site-migration-how-to-migrate'
							: '/setup/site-setup/importerSquarespace'
					);
					expect( destination.searchParams.get( 'siteSlug' ) ).toBe( 'destination.wordpress.com' );
					expect( destination.searchParams.get( 'from' ) ).toBe(
						'https://unreachable.example.com'
					);
					expect( goToCheckout ).not.toHaveBeenCalled();
				}
			);
			it.each( [ 'wordpress', 'unknown', 'squarespace' ] )(
				'routes a detected %s source with the flag enabled',
				( platform ) => {
					jest
						.spyOn( config, 'isEnabled' )
						.mockImplementation( ( flag ) => flag === 'migration/reprint-flow' );
					jest.mocked( getCurrentUserSiteCount ).mockReturnValue( 2 );
					const source = {
						from: 'https://example.com',
						platform,
						isWpcom: platform === 'wordpress',
					};
					const destination = runNavigation( {
						from: STEPS.SITE_MIGRATION_IDENTIFY,
						dependencies: { action: 'continue', ...source },
					} );
					expect( destination ).toMatchDestination( {
						step: platform === 'wordpress' ? STEPS.SITE_MIGRATION_CHECK : STEPS.PICK_SITE,
						query: platform === 'wordpress' ? { ...source, isWpcom: 'true' } : undefined,
					} );
				}
			);

			it( 'clears stale hosting and WordPress.com detection when checking an edited source', () => {
				jest
					.spyOn( config, 'isEnabled' )
					.mockImplementation( ( flag ) => flag === 'migration/reprint-flow' );
				const destination = runNavigation( {
					from: STEPS.SITE_MIGRATION_IDENTIFY,
					dependencies: {
						action: 'continue',
						from: 'https://new.example.com',
						platform: 'wordpress',
					},
					query: { from: 'https://old.example.com', host: 'bluehost', isWpcom: 'true' },
				} );
				expect( destination ).toMatchDestination( {
					step: STEPS.SITE_MIGRATION_CHECK,
					query: {
						from: 'https://new.example.com',
						platform: 'wordpress',
						host: '',
						isWpcom: 'false',
					},
				} );
			} );

			it( 'rejects continuing a WordPress.com source from the result', () => {
				jest
					.spyOn( config, 'isEnabled' )
					.mockImplementation( ( flag ) => flag === 'migration/reprint-flow' );
				const destination = runNavigation( {
					from: STEPS.SITE_MIGRATION_CHECK,
					dependencies: { action: 'continue', from: 'https://example.com', platform: 'wordpress' },
					query: { platform: 'wordpress', isWpcom: 'true' },
				} );
				expect( destination ).toMatchDestination( { step: STEPS.SITE_MIGRATION_IDENTIFY } );
			} );
		} );

		//TODO: Move it to the top be the first test group to follow the order of the flow
		describe( 'SITE_MIGRATION_IDENTIFY', () => {
			beforeEach( () => {
				jest.clearAllMocks();
			} );

			it( 'redirects to site CREATE_SITE step when there is no destination site (siteSlug/siteId)', async () => {
				jest.spyOn( config, 'isEnabled' ).mockReturnValue( false );
				const source = {
					from: 'https://example-to-be-migrated.com',
					platform: 'wordpress',
					host: 'bluehost',
				};
				const destination = runNavigation( {
					from: STEPS.SITE_MIGRATION_IDENTIFY,
					dependencies: { action: 'continue', ...source },
				} );

				await waitFor( () => {
					expect( destination ).toMatchDestination( {
						step: STEPS.SITE_CREATION_STEP,
						query: source,
					} );
				} );
			} );

			it( 'redirects to CREATE_SITE keeping the platform query param when it exists', async () => {
				const destination = runNavigation( {
					from: STEPS.SITE_MIGRATION_IDENTIFY,
					dependencies: {
						platform: 'wordpress',
					},
					query: {
						platform: 'wordpress',
					},
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.SITE_CREATION_STEP,
					query: {
						platform: 'wordpress',
					},
				} );
			} );

			it( 'redirects to PICK_SITE when there is not destination site (siteSlug/siteId) and the user has other wpcom sites', async () => {
				jest.mocked( getCurrentUserSiteCount ).mockReturnValue( 2 );

				const destination = runNavigation( {
					from: STEPS.SITE_MIGRATION_IDENTIFY,
					dependencies: {
						platform: 'wordpress',
						from: 'https://example-to-be-migrated.com',
					},
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.PICK_SITE,
					query: {
						from: 'https://example-to-be-migrated.com',
					},
				} );
			} );

			it( 'redirects to HOW_TO_MIGRATE when there is a destination site (siteSlug/siteId) and platform is wordpress', async () => {
				const destination = runNavigation( {
					from: STEPS.SITE_MIGRATION_IDENTIFY,
					dependencies: {
						platform: 'wordpress',
						from: 'https://example-to-be-migrated.com',
					},
					query: {
						siteId: 123,
						siteSlug: 'example.wordpress.com',
					},
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.SITE_MIGRATION_HOW_TO_MIGRATE,
					query: {
						siteId: 123,
						siteSlug: 'example.wordpress.com',
						from: 'https://example-to-be-migrated.com',
					},
				} );
			} );

			it( 'redirects to site-setup>IMPORT_LIST when there is a destination site (siteSlug/siteId) and platform is not wordpress', async () => {
				runNavigation( {
					from: STEPS.SITE_MIGRATION_IDENTIFY,
					dependencies: {
						platform: 'non-wordpress-site',
						from: 'https://example-to-be-migrated.com',
					},
					query: {
						siteId: 123,
						siteSlug: 'example.wordpress.com',
					},
				} );

				expect( window.location.assign ).toMatchURL( {
					path: '/setup/site-setup/importList',
					query: {
						siteId: 123,
						siteSlug: 'example.wordpress.com',
						from: 'https://example-to-be-migrated.com',
					},
				} );
			} );

			it( 'redirects to HOW_TO_MIGRATE when there is a destination site (siteSlug/siteId) and platform wordpress', async () => {
				const destination = runNavigation( {
					from: STEPS.SITE_MIGRATION_IDENTIFY,
					dependencies: {
						platform: 'wordpress',
						from: 'https://example-to-be-migrated.com',
					},
					query: {
						siteId: 123,
						siteSlug: 'example.wordpress.com',
					},
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.SITE_MIGRATION_HOW_TO_MIGRATE,
					query: {
						siteId: 123,
						siteSlug: 'example.wordpress.com',
						from: 'https://example-to-be-migrated.com',
					},
				} );
			} );

			it( 'redirects to the importer when the platform is importable', () => {
				runNavigation( {
					from: STEPS.SITE_MIGRATION_IDENTIFY,
					dependencies: {
						platform: 'squarespace',
						from: 'https://site-to-be-migrated.com',
					},
					query: {
						siteId: 123,
						siteSlug: 'example.wordpress.com',
					},
				} );

				expect( window.location.assign ).toMatchURL( {
					path: '/setup/site-setup/importerSquarespace',
					query: { from: 'https://site-to-be-migrated.com' },
				} );
			} );

			describe.each( [ false, true ] )(
				'with static-site import enabled (Reprint: %s)',
				( reprint ) => {
					beforeEach( () => {
						jest
							.spyOn( config, 'isEnabled' )
							.mockImplementation(
								( flag ) =>
									flag === 'migration/non-wordpress-source' ||
									( reprint && flag === 'migration/reprint-flow' )
							);
					} );

					it( 'hands a non-WordPress source to the static-site import flow', () => {
						runNavigation( {
							from: STEPS.SITE_MIGRATION_IDENTIFY,
							dependencies: {
								action: 'continue',
								platform: 'wix',
								from: 'https://site-to-be-migrated.com',
							},
						} );

						expect( window.location.assign ).toMatchURL( {
							path: '/setup/static-site-import/static-site-import-reading',
							query: { from: 'https://site-to-be-migrated.com', platform: 'wix' },
						} );
					} );

					it( 'carries the destination site along', () => {
						runNavigation( {
							from: STEPS.SITE_MIGRATION_IDENTIFY,
							dependencies: {
								action: 'continue',
								platform: 'squarespace',
								from: 'https://site-to-be-migrated.com',
							},
							query: { siteId: 123, siteSlug: 'example.wordpress.com' },
						} );

						expect( window.location.assign ).toMatchURL( {
							path: '/setup/static-site-import/static-site-import-reading',
							query: {
								from: 'https://site-to-be-migrated.com',
								platform: 'squarespace',
								siteId: '123',
								siteSlug: 'example.wordpress.com',
							},
						} );
					} );

					it( 'keeps WordPress sources in this flow', async () => {
						const destination = runNavigation( {
							from: STEPS.SITE_MIGRATION_IDENTIFY,
							dependencies: {
								action: 'continue',
								platform: 'wordpress',
								from: 'https://site-to-be-migrated.com',
							},
						} );

						await waitFor( () => {
							expect( destination ).toMatchDestination( {
								step: reprint ? STEPS.SITE_MIGRATION_CHECK : STEPS.SITE_CREATION_STEP,
								query: { from: 'https://site-to-be-migrated.com' },
							} );
						} );
					} );
				}
			);
		} );

		describe( 'flagged plans and existing destination navigation', () => {
			const context = {
				from: 'https://source.example.com',
				platform: 'wordpress',
				host: 'bluehost',
				ref: 'new-site-popover',
				source: 'sites-dashboard',
				flags: 'migration/reprint-flow',
			};
			let recoveryClient: QueryClient;
			beforeEach( () => {
				jest
					.spyOn( config, 'isEnabled' )
					.mockImplementation(
						( flag ) => flag === 'migration/reprint-flow' || flag === 'migration/ssh-migration'
					);
				recoveryClient = new QueryClient();
				jest.mocked( useQueryClient ).mockReturnValue( recoveryClient );
				jest
					.mocked( useFlowState().get )
					.mockImplementation(
						( key ) => recoveryClient.getQueryData( useFlowState().queryKey )?.[ key ]
					);

				jest.mocked( goToCheckout ).mockClear();
			} );

			it.each( [
				[ {}, true ],
				[ { platform: 'squarespace' }, false ],
				[ { from: '' }, false ],
				[ { isWpcom: 'true' }, false ],
				[ { action: 'import' }, false ],
				[ { how: HOW_TO_MIGRATE_OPTIONS.DO_IT_FOR_ME }, false ],
			] )( 'skips picker confirmation only for WordPress DIY: %j', ( overrides, expected ) => {
				const query = new URLSearchParams( { ...context, ...overrides } );
				const { result } = renderHookWithProvider( () => siteMigrationFlow.useStepsProps(), {
					wrapper: ( { children } ) => (
						<MemoryRouter initialEntries={ [ `/setup/site-migration/sitePicker?${ query }` ] }>
							{ children }
						</MemoryRouter>
					),
				} );
				expect( result.current.sitePicker.skipConfirmation ).toBe( expected );
			} );

			it.each( [ null, { features: { active: [] }, product_name_short: 'Free' } ] )(
				'waits for plan data or opens plans for an ineligible supplied destination: %j',
				( plan ) => {
					jest.spyOn( siteData, 'useSiteData' ).mockReturnValue( {
						siteId: 123,
						siteSlug: 'example.wordpress.com',
						site: plan ? { plan } : null,
					} );
					const { result: props } = renderHookWithProvider(
						() => siteMigrationFlow.useStepsProps(),
						{
							wrapper: MemoryRouter,
						}
					);
					expect( props.current[ STEPS.SITE_MIGRATION_CHECK.slug ] ).toEqual( {
						copySiteEligibility: 'ineligible',
						destinationSiteSlug: 'example.wordpress.com',
						destinationPlanName: plan?.product_name_short,
						needsUpgrade: !! plan,
						isLoadingDestination: ! plan,
						destinationFailed: false,
						onRetryDestination: expect.any( Function ),
					} );
					const result = runNavigation( {
						from: STEPS.SITE_MIGRATION_CHECK,
						query: { ...context, siteId: 123, siteSlug: 'example.wordpress.com' },
						dependencies: { ...context, action: 'continue' },
					} );
					expect( result ).toMatchDestination( {
						step: plan ? STEPS.UNIFIED_PLANS : STEPS.SITE_MIGRATION_CHECK,
					} );
					expect( window.location.assign ).not.toHaveBeenCalled();
					expect( goToCheckout ).not.toHaveBeenCalled();
				}
			);

			it( 'creates a destination after selecting a plan', () => {
				const result = runNavigation( {
					from: STEPS.UNIFIED_PLANS,
					query: context,
					dependencies: {
						stepName: 'plans',
						cartItems: [ { product_slug: PLAN_BUSINESS_MONTHLY } ],
					},
				} );
				expect( result ).toMatchDestination( { step: STEPS.SITE_CREATION_STEP } );
				expect( select( ONBOARD_STORE ).getPlanCartItem() ).toEqual( {
					product_slug: PLAN_BUSINESS_MONTHLY,
				} );
				expect( window.location.assign ).not.toHaveBeenCalled();
				expect( goToCheckout ).not.toHaveBeenCalled();
			} );

			it( 'rejects plans continuation without a source address', () => {
				const result = runNavigation( {
					from: STEPS.UNIFIED_PLANS,
					query: { ...context, from: '' },
					dependencies: { action: 'select-existing-site' },
				} );
				expect( result ).toMatchDestination( { step: STEPS.SITE_MIGRATION_IDENTIFY } );
			} );

			it( 'returns to plans when creating a site from the picker', () => {
				const result = runNavigation( {
					from: STEPS.PICK_SITE,
					query: context,
					dependencies: { action: 'create-site' },
				} );
				expect( result ).toMatchDestination( { step: STEPS.UNIFIED_PLANS } );
				expect( goToCheckout ).not.toHaveBeenCalled();
			} );

			it( 'reports a destination that can’t be loaded instead of waiting on it', () => {
				jest
					.spyOn( config, 'isEnabled' )
					.mockImplementation( ( flag ) => flag === 'migration/reprint-flow' );
				const refetch = jest.fn();
				jest.spyOn( siteData, 'useSiteData' ).mockReturnValue( {
					siteId: 123,
					siteSlug: 'example.wordpress.com',
					site: null,
				} as unknown as ReturnType< typeof siteData.useSiteData > );
				jest.mocked( useSiteQuery ).mockReturnValue( {
					data: null,
					isLoading: false,
					isError: true,
					refetch,
				} );
				const { result: props } = renderHookWithProvider( () => siteMigrationFlow.useStepsProps(), {
					wrapper: MemoryRouter,
				} );
				expect( props.current[ STEPS.SITE_MIGRATION_CHECK.slug ] ).toEqual(
					expect.objectContaining( {
						isLoadingDestination: false,
						destinationFailed: true,
						onRetryDestination: refetch,
					} )
				);
			} );

			it( 'configures an eligible destination before handing off to MSD with original entry context', async () => {
				jest.mocked( useFlowState().get ).mockReturnValue( { entryPoint: 'move-lp' } );
				const destination = { siteId: 123, siteSlug: 'example.wordpress.com' };
				jest.spyOn( siteData, 'useSiteData' ).mockReturnValue( {
					...destination,
					site: {
						plan: { product_name_short: 'Personal', features: { active: [ 'install-plugins' ] } },
					},
				} );
				const { result: props } = renderHookWithProvider( () => siteMigrationFlow.useStepsProps(), {
					wrapper: MemoryRouter,
				} );
				expect( props.current[ STEPS.SITE_MIGRATION_CHECK.slug ] ).toEqual( {
					copySiteEligibility: 'ineligible',
					destinationSiteSlug: destination.siteSlug,
					destinationPlanName: 'Personal',
					needsUpgrade: false,
					isLoadingDestination: false,
					destinationFailed: false,
					onRetryDestination: expect.any( Function ),
				} );
				const configure = nock( 'https://public-api.wordpress.com' )
					.post( '/wpcom/v2/sites/123/wordpress-migration/configure', { source_url: context.from } )
					.reply( 200, { source_url: context.from } );
				runNavigation( {
					from: STEPS.SITE_MIGRATION_CHECK,
					query: { ...context, ...destination },
					dependencies: { ...context, action: 'continue' },
				} );
				await waitFor( () => expect( window.location.assign ).toHaveBeenCalled() );
				expect( configure.isDone() ).toBe( true );
				expect( window.location.assign ).toMatchURL( {
					path: dashboardLink( '/sites/example.wordpress.com/migration-overview' ),
					query: {
						ref: 'move-lp',
						source: context.source,
						sessionId: '123',
						flags: context.flags,
					},
				} );
				expect( goToCheckout ).not.toHaveBeenCalled();
			} );

			it.each( [ STEPS.UNIFIED_PLANS, STEPS.PROCESSING ] )(
				'configures before checkout after $slug and retains the destination when cancelling',
				async ( step ) => {
					const destination = { siteId: 123, siteSlug: 'example.wordpress.com' };
					const configure = nock( 'https://public-api.wordpress.com' )
						.post( '/wpcom/v2/sites/123/wordpress-migration/configure', {
							source_url: context.from,
						} )
						.reply( 200, {} );
					runNavigation( {
						from: step,
						query: { ...context, ...( step === STEPS.UNIFIED_PLANS && destination ) },
						dependencies:
							step === STEPS.PROCESSING
								? { ...destination, siteCreated: true }
								: { cartItems: [ { product_slug: PLAN_BUSINESS_MONTHLY } ] },
					} );
					await waitFor( () => expect( goToCheckout ).toHaveBeenCalledTimes( 1 ) );
					expect( configure.isDone() ).toBe( true );
					const checkout = jest.mocked( goToCheckout ).mock.calls[ 0 ][ 0 ];
					expect( checkout.historyBack ).toBeUndefined();
					expect( checkout ).toEqual(
						expect.objectContaining( {
							flowName: 'site-migration',
							stepName: 'plans',
							siteSlug: destination.siteSlug,
							plan: step === STEPS.UNIFIED_PLANS ? PLAN_BUSINESS_MONTHLY : undefined,
						} )
					);
					const returnUrl = new URL( checkout.destination, 'https://example.com' );
					expect( returnUrl.pathname ).toBe(
						new URL(
							dashboardLink( `/sites/${ destination.siteSlug }/migration-overview` ),
							'https://example.com'
						).pathname
					);
					expect( returnUrl.searchParams.get( 'ref' ) ).toBe( context.ref );
					const cancelUrl = new URL( checkout.cancelDestination, 'https://example.com' );
					expect( cancelUrl.pathname ).toBe( '/setup/site-migration/plans' );
					for ( const [ key, value ] of Object.entries( { ...context, ...destination } ) ) {
						expect( cancelUrl.searchParams.get( key ) ).toBe( String( value ) );
					}
					jest.requireActual( 'calypso/landing/stepper/utils/checkout' ).goToCheckout( checkout );
					const checkoutUrl = new URL(
						window.location.replace.mock.lastCall[ 0 ],
						'https://example.com'
					);
					expect( checkoutUrl.searchParams.get( 'redirect_to' ) ).toBe( checkout.destination );
					Object.assign( window.location, { href: checkoutUrl.href, search: checkoutUrl.search } );
					leaveCheckout( { siteSlug: destination.siteSlug, tracksEvent: 'checkout_cancel' } );
					expect( window.location.href ).toBe( checkout.cancelDestination );
					window.location.search = '';
					expect( window.location.assign ).not.toHaveBeenCalled();
				}
			);

			it.each( [ STEPS.UNIFIED_PLANS, STEPS.SITE_MIGRATION_CHECK ] )(
				'recovers a configure failure after $slug with an explicit retry on the same destination',
				async ( step ) => {
					const destination = { siteId: 123, siteSlug: 'example.wordpress.com' };
					jest.spyOn( siteData, 'useSiteData' ).mockReturnValue( {
						...destination,
						site: { plan: { features: { active: [ 'install-plugins' ] } } },
					} );
					const configure = nock( 'https://public-api.wordpress.com' )
						.post( '/wpcom/v2/sites/123/wordpress-migration/configure', {
							source_url: context.from,
						} )
						.reply( 503, {} );
					const query = new URLSearchParams( { ...context, ...destination } );
					const initial = renderNavigation( [ `/setup/site-migration/${ step.slug }?${ query }` ] );
					act( () =>
						initial.result.current.navigation.submit(
							step === STEPS.UNIFIED_PLANS
								? { cartItems: [ { product_slug: PLAN_BUSINESS_MONTHLY } ] }
								: { ...context, action: 'continue' }
						)
					);
					await waitFor( () =>
						expect( initial.result.current.location.pathname ).toBe( '/site-migration/error' )
					);
					expect( configure.isDone() ).toBe( true );
					expect( initial.result.current.navigationType ).toBe( 'REPLACE' );
					const errorUrl = `/setup${ initial.result.current.location.pathname }${ initial.result.current.location.search }`;
					expect(
						new URLSearchParams( initial.result.current.location.search ).get( 'siteId' )
					).toBe( '123' );
					expect( goToCheckout ).not.toHaveBeenCalled();
					expect( window.location.assign ).not.toHaveBeenCalled();
					initial.unmount();
					const retry = nock( 'https://public-api.wordpress.com' )
						.post( '/wpcom/v2/sites/123/wordpress-migration/configure', {
							source_url: context.from,
						} )
						.reply( 200, {} );
					const reloaded = renderNavigation( [ errorUrl ] );
					reloaded.rerender();
					const { result: stepProps } = renderHookWithProvider(
						() => siteMigrationFlow.useStepsProps(),
						{
							wrapper: ( { children } ) => (
								<MemoryRouter initialEntries={ [ errorUrl ] }>{ children }</MemoryRouter>
							),
						}
					);
					expect( stepProps.current.error.showRetry ).toBe( true );
					expect( retry.isDone() ).toBe( false );
					act( () => reloaded.result.current.navigation.submit( { action: 'retry' } ) );
					await waitFor( () =>
						expect(
							step === STEPS.UNIFIED_PLANS ? goToCheckout : window.location.assign
						).toHaveBeenCalledTimes( 1 )
					);
					expect( retry.isDone() ).toBe( true );
					expect( goToCheckout ).toHaveBeenCalledTimes( step === STEPS.UNIFIED_PLANS ? 1 : 0 );
					expect( window.location.assign ).toHaveBeenCalledTimes(
						step === STEPS.SITE_MIGRATION_CHECK ? 1 : 0
					);
					const checkout = goToCheckout.mock.calls[ 0 ]?.[ 0 ];
					expect( checkout?.siteSlug ).toBe(
						step === STEPS.UNIFIED_PLANS ? destination.siteSlug : undefined
					);
					expect( checkout?.plan ).toBe(
						step === STEPS.UNIFIED_PLANS ? PLAN_BUSINESS_MONTHLY : undefined
					);
				}
			);

			it( 'restores the created destination on browser Back and reuses it from plans', async () => {
				jest
					.spyOn( siteData, 'useSiteData' )
					.mockReturnValue( { siteId: 0, siteSlug: '', site: null } );
				const destination = { siteId: 123, siteSlug: 'example.wordpress.com' };
				const query = new URLSearchParams( context );
				const configure = nock( 'https://public-api.wordpress.com' )
					.post( '/wpcom/v2/sites/123/wordpress-migration/configure' )
					.reply( 503, {} );
				const { result } = renderNavigation(
					[
						`/setup/site-migration/plans?${ query }`,
						`/setup/site-migration/processing?${ query }`,
					],
					1
				);
				const createdSite = { ...destination, requestedName: '' };
				recoveryClient.setQueryData( useFlowState().queryKey, { createdSite } );
				// Model a setter captured before the asynchronous creation completed.
				jest.mocked( useFlowState().set ).mockImplementation( ( key, value ) => {
					recoveryClient.setQueryData( useFlowState().queryKey, { [ key ]: value } );
					return value;
				} );
				act( () => result.current.navigation.submit( { ...destination, siteCreated: true } ) );
				await waitFor( () =>
					expect( result.current.location.pathname ).toBe( '/site-migration/error' )
				);
				expect( configure.isDone() ).toBe( true );
				expect( recoveryClient.getQueryData( useFlowState().queryKey ).createdSite ).toEqual(
					createdSite
				);
				act( () => result.current.back() );
				expect( result.current.location.pathname ).toBe( '/site-migration/plans' );
				const plansQuery = new URLSearchParams( result.current.location.search );
				expect( plansQuery.get( 'siteId' ) ).toBe( '123' );
				expect( plansQuery.get( 'siteSlug' ) ).toBe( destination.siteSlug );
				const retry = nock( 'https://public-api.wordpress.com' )
					.post( '/wpcom/v2/sites/123/wordpress-migration/configure' )
					.reply( 200, {} );
				expect( retry.isDone() ).toBe( false );
				act( () =>
					result.current.navigation.submit( {
						cartItems: [ { product_slug: PLAN_BUSINESS_MONTHLY } ],
					} )
				);
				await waitFor( () => expect( goToCheckout ).toHaveBeenCalledTimes( 1 ) );
				expect( result.current.location.pathname ).toBe( '/site-migration/plans' );
				expect( goToCheckout ).toHaveBeenCalledWith(
					expect.objectContaining( { siteSlug: destination.siteSlug } )
				);
			} );

			it( 'does not configure on mount or reload at processing', () => {
				const destination = { siteId: 123, siteSlug: 'example.wordpress.com' };
				recoveryClient.setQueryData( useFlowState().queryKey, {
					migrationHandoff: { ...destination, from: context.from, shouldGoToCheckout: true },
				} );
				const configure = nock( 'https://public-api.wordpress.com' )
					.post( '/wpcom/v2/sites/123/wordpress-migration/configure' )
					.reply( 200, {} );
				const query = new URLSearchParams( { ...context, ...destination } );
				const mount = () => renderNavigation( [ `/setup/site-migration/processing?${ query }` ] );
				const first = mount();
				first.rerender();
				first.unmount();
				mount();
				expect( configure.isDone() ).toBe( false );
				expect( goToCheckout ).not.toHaveBeenCalled();
				expect( window.location.assign ).not.toHaveBeenCalled();
				nock.removeInterceptor( configure.interceptors[ 0 ] );
			} );

			it( 'disables migration recovery with the flag off', () => {
				jest.spyOn( config, 'isEnabled' ).mockReturnValue( false );
				const destination = { siteId: 123, siteSlug: 'example.wordpress.com' };
				recoveryClient.setQueryData( useFlowState().queryKey, {
					migrationHandoff: { ...destination, from: context.from, shouldGoToCheckout: true },
				} );
				jest.spyOn( siteData, 'useSiteData' ).mockReturnValue( { ...destination, site: null } );
				const query = new URLSearchParams( { ...context, ...destination } );
				const { result: props } = renderHookWithProvider( () => siteMigrationFlow.useStepsProps(), {
					wrapper: ( { children } ) => (
						<MemoryRouter initialEntries={ [ `/setup/site-migration/error?${ query }` ] }>
							{ children }
						</MemoryRouter>
					),
				} );
				expect( props.current.error.showRetry ).toBe( false );
				expect( props.current.sitePicker.skipConfirmation ).toBe( false );
				const result = runNavigation( {
					from: STEPS.ERROR,
					query: { ...context, ...destination },
					dependencies: { action: 'retry' },
				} );
				expect( result.step ).toBe( STEPS.ERROR.slug );
				expect( goToCheckout ).not.toHaveBeenCalled();
				expect( window.location.assign ).not.toHaveBeenCalled();
			} );

			it.each( [ false, true ] )(
				'ignores repeat clicks and a late response after leaving (leave: %s)',
				async ( leave ) => {
					const destination = { siteId: 123, siteSlug: 'example.wordpress.com' };
					let respond;
					const requested = jest.fn();
					const configure = nock( 'https://public-api.wordpress.com' )
						.post( '/wpcom/v2/sites/123/wordpress-migration/configure' )
						.reply( ( uri, body, callback ) => {
							requested();
							respond = () => callback( null, [ 200, {} ] );
						} );
					const { result, rerender } = renderHookWithProvider(
						( { step } ) => siteMigrationFlow.useStepNavigation( step, jest.fn() ),
						{
							initialProps: { step: STEPS.UNIFIED_PLANS.slug },
							wrapper: ( { children } ) => (
								<MemoryRouter
									initialEntries={ [
										`/site-migration/plans?${ new URLSearchParams( { ...context, ...destination } ) }`,
									] }
								>
									{ children }
								</MemoryRouter>
							),
						}
					);
					const submission = {
						slug: STEPS.UNIFIED_PLANS.slug,
						providedDependencies: { cartItems: [ { product_slug: PLAN_BUSINESS_MONTHLY } ] },
					};
					let pending;
					act( () => {
						pending = result.current.submit( submission );
						result.current.submit( submission );
					} );
					await waitFor( () => expect( requested ).toHaveBeenCalledTimes( 1 ) );
					if ( leave ) {
						rerender( { step: STEPS.SITE_MIGRATION_IDENTIFY.slug } );
					}
					await act( async () => {
						respond();
						await pending;
					} );
					expect( configure.isDone() ).toBe( true );
					expect( goToCheckout ).toHaveBeenCalledTimes( leave ? 0 : 1 );
				}
			);

			it( 'keeps explicit assisted migration links on the legacy route', () => {
				const result = runNavigation( {
					from: STEPS.PICK_SITE,
					query: { ...context, how: HOW_TO_MIGRATE_OPTIONS.DO_IT_FOR_ME, action: 'migrate' },
					dependencies: { action: 'select-site', site: { ID: 123, slug: 'example.wordpress.com' } },
				} );
				expect( result ).toMatchDestination( { step: STEPS.SITE_MIGRATION_HOW_TO_MIGRATE } );
				expect( window.location.assign ).not.toHaveBeenCalled();
			} );
		} );

		describe( 'PICK_SITE', () => {
			describe.each( [ true, false ] )( 'query updates with Reprint enabled: %s', ( enabled ) => {
				afterEach( () => {
					window.location.search = '';
				} );
				it( 'clears empty filters, retains new values and preserves migration context', () => {
					jest.spyOn( config, 'isEnabled' ).mockReturnValue( enabled );
					const context = {
						from: 'https://source.com/',
						platform: 'wordpress',
						host: 'bluehost',
						source: 'sites-dashboard',
						ref: 'new-site-popover',
						sessionId: 'abc',
						...( enabled && { flags: 'migration/reprint-flow' } ),
					};
					const search = new URLSearchParams( {
						...context,
						search: 'old-search',
						status: 'private',
						page: '3',
					} );
					const { result } = renderNavigation( [ `/setup/site-migration/sitePicker?${ search }` ] );
					act( () =>
						result.current.navigation.submit( {
							action: 'update-query',
							queryParams: { search: '', status: 'public', page: undefined },
						} )
					);
					expect( result.current.location.pathname ).toBe( '/site-migration/sitePicker' );
					expect(
						Object.fromEntries( new URLSearchParams( result.current.location.search ) )
					).toEqual( {
						...context,
						search: '',
						status: 'public',
						page: '',
					} );
					expect( result.current.navigationType ).toBe( 'REPLACE' );
				} );
			} );

			it( 'redirects to HOW_TO_MIGRATE when a site is selected', () => {
				const destination = runNavigation( {
					from: STEPS.PICK_SITE,
					dependencies: {
						action: 'select-site',
						site: {
							ID: 123,
							slug: 'example.wordpress.com',
						},
					},
					query: {
						platform: 'wordpress',
					},
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.SITE_MIGRATION_HOW_TO_MIGRATE,
					query: {
						siteSlug: 'example.wordpress.com',
						siteId: 123,
					},
				} );
			} );

			it( 'preserves migration origin when a site is selected without identifying a platform', () => {
				runNavigation( {
					from: STEPS.PICK_SITE,
					dependencies: {
						action: 'select-site',
						site: {
							ID: 123,
							slug: 'example.wordpress.com',
						},
					},
				} );

				expect( window.location.assign ).toMatchURL( {
					path: '/setup/site-setup/importList',
					query: {
						backToFlow: '/site-migration/sitePicker',
						origin: STEPS.SITE_MIGRATION_IDENTIFY.slug,
						sessionId: 123,
						siteId: 123,
						siteSlug: 'example.wordpress.com',
					},
				} );
			} );

			it( 'redirects to HOW_TO_MIGRATE step if a site is selected and the query action is migrate', () => {
				jest
					.spyOn( config, 'isEnabled' )
					.mockImplementation( ( flag ) => flag === 'migration/reprint-flow' );
				const destination = runNavigation( {
					from: STEPS.PICK_SITE,
					query: {
						action: 'migrate',
						how: HOW_TO_MIGRATE_OPTIONS.DO_IT_FOR_ME,
						from: 'https://unreachable.example.com',
						platform: 'wordpress',
					},
					dependencies: {
						action: 'select-site',
						site: {
							ID: 123,
							slug: 'example.wordpress.com',
						},
					},
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.SITE_MIGRATION_HOW_TO_MIGRATE,
					query: {
						siteSlug: 'example.wordpress.com',
						siteId: 123,
					},
				} );
			} );

			it( 'redirects to SITE_CREATION_STEP the user decides to create a new site', () => {
				const destination = runNavigation( {
					from: STEPS.PICK_SITE,
					dependencies: {
						action: 'create-site',
					},
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.SITE_CREATION_STEP,
				} );
			} );
			it.each( [ 'squarespace', 'wordpress' ] )(
				'opens the %s importer for a selected destination',
				( platform ) => {
					jest
						.spyOn( config, 'isEnabled' )
						.mockImplementation( ( flag ) => flag === 'migration/reprint-flow' );
					runNavigation( {
						from: STEPS.PICK_SITE,
						dependencies: {
							action: 'select-site',
							site: { ID: 123, slug: 'example.wordpress.com' },
						},
						query: {
							platform,
							action: platform === 'wordpress' ? 'import' : '',
							from: 'https://site-to-be-migrated.com',
							siteId: 123,
							siteSlug: 'example.wordpress.com',
						},
					} );

					expect( window.location.assign ).toMatchURL( {
						path:
							platform === 'wordpress'
								? '/setup/site-setup/importerWordpress'
								: '/setup/site-setup/importerSquarespace',
						query: {
							from: 'https://site-to-be-migrated.com',
							siteSlug: 'example.wordpress.com',
							sessionId: '123',
						},
					} );
				}
			);
		} );

		describe( 'SITE_MIGRATION_HOW_TO_MIGRATE', () => {
			it( 'requires a fresh source check when switching from assisted migration to DIY', () => {
				jest
					.spyOn( config, 'isEnabled' )
					.mockImplementation( ( flag ) => flag === 'migration/reprint-flow' );
				const destination = runNavigation( {
					from: STEPS.SITE_MIGRATION_HOW_TO_MIGRATE,
					dependencies: { how: HOW_TO_MIGRATE_OPTIONS.DO_IT_MYSELF, destination: 'migrate' },
					query: {
						from: 'https://unreachable.example.com',
						platform: 'wordpress',
						siteId: 123,
						siteSlug: 'example.wordpress.com',
						how: HOW_TO_MIGRATE_OPTIONS.DO_IT_FOR_ME,
					},
				} );
				expect( destination ).toMatchDestination( {
					step: STEPS.SITE_MIGRATION_IDENTIFY,
					query: { from: 'https://unreachable.example.com', how: '' },
				} );
				expect( window.location.assign ).not.toHaveBeenCalled();
				expect( goToCheckout ).not.toHaveBeenCalled();
			} );
			it.each( [ undefined, 'https://source.example.com' ] )(
				'opens the WordPress file importer with source %s and a return path to the offer',
				( from ) => {
					jest
						.spyOn( config, 'isEnabled' )
						.mockImplementation( ( flag ) => !! from && flag === 'migration/reprint-flow' );
					runNavigation( {
						from: STEPS.SITE_MIGRATION_HOW_TO_MIGRATE,
						dependencies: { how: HOW_TO_MIGRATE_OPTIONS.DO_IT_MYSELF, destination: 'import' },
						query: {
							siteId: 123,
							siteSlug: 'example.wordpress.com',
							platform: 'wordpress',
							...( from && { from } ),
						},
					} );

					expect( window.location.assign ).toMatchURL( {
						path: '/setup/site-setup/importerWordpress',
						query: {
							siteId: 123,
							siteSlug: 'example.wordpress.com',
							backToFlow: '/site-migration/site-migration-how-to-migrate',
							ref: 'site-migration',
							sessionId: '123',
							...( from && { from } ),
						},
					} );
					expect( goToCheckout ).not.toHaveBeenCalled();
				}
			);

			it( 'redirects to SITE_MIGRATION_UPGRADE_PLAN step when an upgrade is required', () => {
				const destination = runNavigation( {
					from: STEPS.SITE_MIGRATION_HOW_TO_MIGRATE,
					dependencies: {
						destination: 'upgrade',
					},
					query: {
						siteSlug: 'example.wordpress.com',
						siteId: 123,
						from: 'https://site-to-be-migrated.com',
					},
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.SITE_MIGRATION_UPGRADE_PLAN,
					query: {
						siteSlug: 'example.wordpress.com',
						siteId: 123,
						from: 'https://site-to-be-migrated.com',
					},
				} );
			} );

			it( 'redirects to SITE_MIGRATION_CREDENTIALS step when DIFM is selected', () => {
				const destination = runNavigation( {
					from: STEPS.SITE_MIGRATION_HOW_TO_MIGRATE,
					dependencies: {
						how: HOW_TO_MIGRATE_OPTIONS.DO_IT_FOR_ME,
					},
					query: {
						siteSlug: 'example.wordpress.com',
						siteId: 123,
						from: 'https://site-to-be-migrated.com',
					},
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.SITE_MIGRATION_CREDENTIALS,
					query: {
						siteSlug: 'example.wordpress.com',
						siteId: 123,
						from: 'https://site-to-be-migrated.com',
					},
				} );
			} );

			it( 'redirects to SITE_MIGRATION_INSTRUCTIONS when step "myself" is selected', () => {
				jest.spyOn( config, 'isEnabled' ).mockReturnValue( false );
				const destination = runNavigation( {
					from: STEPS.SITE_MIGRATION_HOW_TO_MIGRATE,
					dependencies: {
						how: HOW_TO_MIGRATE_OPTIONS.DO_IT_MYSELF,
						destination: 'migrate',
					},
					query: {
						siteSlug: 'example.wordpress.com',
						siteId: 123,
						from: 'https://source.example.com',
						platform: 'wordpress',
					},
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.SITE_MIGRATION_INSTRUCTIONS,
					query: {
						siteSlug: 'example.wordpress.com',
					},
				} );
				expect( window.location.assign ).not.toHaveBeenCalled();
			} );

			it( 'redirects from SITE_MIGRATION_HOW_TO_MIGRATE (do it for me) page to SITE_MIGRATION_CREDENTIALS step', () => {
				const destination = runNavigation( {
					from: STEPS.SITE_MIGRATION_HOW_TO_MIGRATE,
					dependencies: {
						destination: 'migrate',
						how: HOW_TO_MIGRATE_OPTIONS.DO_IT_FOR_ME,
					},
					query: {
						siteSlug: 'example.wordpress.com',
						siteId: 123,
						from: 'https://site-to-be-migrated.com',
					},
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.SITE_MIGRATION_CREDENTIALS,
					query: {
						siteSlug: 'example.wordpress.com',
					},
				} );
			} );
		} );

		describe( 'WordPress DIY handoff', () => {
			const context = {
				from: 'https://source.example.com',
				siteId: 123,
				siteSlug: 'example.wordpress.com',
				platform: 'wordpress',
				host: 'bluehost',
				ref: 'move-lp',
				source: 'sites-dashboard',
				flags: 'migration/reprint-flow',
			};

			describe( 'with the flag enabled', () => {
				beforeEach( () => {
					jest
						.spyOn( config, 'isEnabled' )
						.mockImplementation( ( flag ) => flag === 'migration/reprint-flow' );
				} );

				it( 'shows the destination comparison before a legacy DIY handoff', () => {
					const search = new URLSearchParams(
						Object.entries( context ).map( ( [ key, value ] ) => [ key, String( value ) ] )
					);
					const { result } = renderNavigation( [
						`/setup/site-migration/site-migration-how-to-migrate?${ search }`,
					] );
					act( () =>
						result.current.navigation.submit( {
							how: HOW_TO_MIGRATE_OPTIONS.DO_IT_MYSELF,
							destination: 'migrate',
						} )
					);
					expect( result.current.location.pathname ).toBe( '/site-migration/site-migration-check' );
					expect(
						Object.fromEntries( new URLSearchParams( result.current.location.search ) )
					).toEqual( expect.objectContaining( Object.fromEntries( search ) ) );
					expect( window.location.assign ).not.toHaveBeenCalled();
					expect( goToCheckout ).not.toHaveBeenCalled();
				} );

				it( 'keeps legacy behavior without a detected WordPress source', () => {
					const result = runNavigation( {
						from: STEPS.SITE_MIGRATION_HOW_TO_MIGRATE,
						dependencies: { how: HOW_TO_MIGRATE_OPTIONS.DO_IT_MYSELF, destination: 'migrate' },
						query: { ...context, platform: undefined },
					} );
					expect( result ).toMatchDestination( { step: STEPS.SITE_MIGRATION_INSTRUCTIONS } );
					expect( window.location.assign ).not.toHaveBeenCalled();
				} );

				it( 'keeps legacy resume behavior without a source address', () => {
					const query = { ...context };
					delete query.from;
					const result = runNavigation( {
						from: STEPS.SITE_MIGRATION_HOW_TO_MIGRATE,
						dependencies: { how: HOW_TO_MIGRATE_OPTIONS.DO_IT_MYSELF, destination: 'migrate' },
						query,
					} );
					expect( result ).toMatchDestination( { step: STEPS.SITE_MIGRATION_INSTRUCTIONS } );
					expect( window.location.assign ).not.toHaveBeenCalled();
				} );

				it( 'keeps assisted migrations on the legacy route', () => {
					const result = runNavigation( {
						from: STEPS.SITE_MIGRATION_HOW_TO_MIGRATE,
						dependencies: { how: HOW_TO_MIGRATE_OPTIONS.DO_IT_FOR_ME, destination: 'migrate' },
						query: context,
					} );
					expect( result ).toMatchDestination( { step: STEPS.SITE_MIGRATION_CREDENTIALS } );
					expect( window.location.assign ).not.toHaveBeenCalled();
				} );
			} );
		} );

		describe( 'SITE_MIGRATION_UPGRADE_PLAN', () => {
			it( 'redirects the user to the checkout page with the correct destination parameters', () => {
				runNavigation( {
					from: STEPS.SITE_MIGRATION_UPGRADE_PLAN,
					dependencies: {
						goToCheckout: true,
						plan: PLAN_BUSINESS_MONTHLY,
					},
					query: {
						siteSlug: 'example.wordpress.com',
						siteId: 123,
						from: 'https://site-to-be-migrated.com',
					},
				} );

				expect( goToCheckout ).toHaveBeenCalledWith( {
					destination: `/setup/site-migration/${ STEPS.SITE_MIGRATION_INSTRUCTIONS.slug }?siteSlug=example.wordpress.com&from=https%3A%2F%2Fsite-to-be-migrated.com&siteId=123`,
					flowName: 'site-migration',
					from: 'https://site-to-be-migrated.com',
					siteSlug: 'example.wordpress.com',
					stepName: STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug,
					plan: PLAN_BUSINESS_MONTHLY,
					historyBack: true,
				} );
			} );
		} );

		describe( 'SITE_MIGRATION_INSTRUCTIONS', () => {
			it( 'redirects to site overview when the migration has started', () => {
				runNavigation( {
					from: STEPS.SITE_MIGRATION_INSTRUCTIONS,
					query: {
						siteSlug: 'example.wordpress.com',
						siteId: 123,
						from: 'https://site-to-be-migrated.com',
					},
				} );

				expect( window.location.assign ).toMatchURL( {
					path: '/overview/example.wordpress.com',
					query: {
						ref: 'site-migration',
					},
				} );
			} );

			it( 'redirects to SITE_MIGRATION_CREDENTIALS step when the user decides to ask for an assisted migration', () => {
				const destination = runNavigation( {
					from: STEPS.SITE_MIGRATION_INSTRUCTIONS,
					dependencies: {
						how: HOW_TO_MIGRATE_OPTIONS.DO_IT_FOR_ME,
					},
					query: {
						siteSlug: 'example.wordpress.com',
						siteId: 123,
						from: 'https://site-to-be-migrated.com',
					},
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.SITE_MIGRATION_CREDENTIALS,
					query: {
						siteSlug: 'example.wordpress.com',
						siteId: 123,
						from: 'https://site-to-be-migrated.com',
					},
				} );
			} );
		} );

		describe( 'SITE_MIGRATION_CREDENTIALS', () => {
			beforeEach( () => {
				jest.clearAllMocks();
			} );

			it( 'redirects to site overview when the user skips', () => {
				runNavigation( {
					from: STEPS.SITE_MIGRATION_CREDENTIALS,
					dependencies: {
						action: 'skip',
						from: 'https://site-to-be-migrated.com',
					},
					query: {
						siteSlug: 'example.wordpress.com',
						siteId: 123,
					},
				} );

				expect( window.location.assign ).toMatchURL( {
					path: '/overview/example.wordpress.com',
					query: {
						ref: 'site-migration',
					},
				} );
			} );

			it( 'redirects to site overview when submitting credentials', () => {
				runNavigation( {
					from: STEPS.SITE_MIGRATION_CREDENTIALS,
					dependencies: {},
					query: {
						siteSlug: 'example.wordpress.com',
						siteId: 123,
					},
				} );

				expect( window.location.assign ).toMatchURL( {
					path: '/overview/example.wordpress.com',
					query: {
						ref: 'site-migration',
					},
				} );
			} );

			it( 'redirects to SITE_MIGRATION_FALLBACK_CREDENTIALS when the user is already on WPCOM', () => {
				const destination = runNavigation( {
					from: STEPS.SITE_MIGRATION_CREDENTIALS,
					dependencies: {
						action: 'already-wpcom',
						from: 'https://site-to-be-migrated.com',
					},
					query: {
						siteSlug: 'example.wordpress.com',
						siteId: 123,
					},
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.SITE_MIGRATION_ALREADY_WPCOM,
					query: {
						siteSlug: 'example.wordpress.com',
						siteId: 123,
						from: 'https://site-to-be-migrated.com',
					},
				} );
			} );

			it( 'redirects to SITE_MIGRATION_OTHER_PLATFORM_DETECTED_IMPORT step when the site platform is not WordPress', () => {
				const destination = runNavigation( {
					from: STEPS.SITE_MIGRATION_CREDENTIALS,
					dependencies: {
						action: 'site-is-not-using-wordpress',
						platform: 'squarespace',
					},
					query: {
						siteSlug: 'example.wordpress.com',
						siteId: 123,
						from: 'https://site-to-be-migrated.com',
					},
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.SITE_MIGRATION_OTHER_PLATFORM_DETECTED_IMPORT,
					query: {
						siteSlug: 'example.wordpress.com',
						platform: 'squarespace',
					},
				} );
			} );

			it( 'redirects to SITE_MIGRATION_APPLICATION_PASSWORD_AUTHORIZATION when the user uses application passwords', () => {
				const destination = runNavigation( {
					from: STEPS.SITE_MIGRATION_CREDENTIALS,
					dependencies: {
						action: 'application-passwords-approval',
						from: 'https://site-to-be-migrated.com',
					},
					query: {
						siteSlug: 'example.wordpress.com',
						siteId: 123,
					},
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.SITE_MIGRATION_APPLICATION_PASSWORD_AUTHORIZATION,
					query: {
						siteSlug: 'example.wordpress.com',
						siteId: 123,
						from: 'https://site-to-be-migrated.com',
					},
				} );
			} );

			it( 'redirects to SITE_MIGRATION_FALLBACK_CREDENTIALS when credentials are required', () => {
				const destination = runNavigation( {
					from: STEPS.SITE_MIGRATION_CREDENTIALS,
					dependencies: {
						action: 'credentials-required',
						from: 'https://site-to-be-migrated.com',
					},
					query: {
						siteSlug: 'example.wordpress.com',
						siteId: 123,
					},
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.SITE_MIGRATION_FALLBACK_CREDENTIALS,
					query: {
						siteSlug: 'example.wordpress.com',
						siteId: 123,
						from: 'https://site-to-be-migrated.com',
					},
				} );
			} );
		} );

		describe( 'SITE_MIGRATION_FALLBACK_CREDENTIALS', () => {
			it( 'redirects to site overview when the user skips', () => {
				runNavigation( {
					from: STEPS.SITE_MIGRATION_FALLBACK_CREDENTIALS,
					dependencies: {
						action: 'skip',
					},
					query: {
						siteSlug: 'example.wordpress.com',
						siteId: 123,
						from: 'https://site-to-be-migrated.com',
					},
				} );

				expect( window.location.assign ).toMatchURL( {
					path: '/overview/example.wordpress.com',
					query: {
						ref: 'site-migration',
					},
				} );
			} );

			it( 'redirects to site overview when submitting credentials', () => {
				runNavigation( {
					from: STEPS.SITE_MIGRATION_FALLBACK_CREDENTIALS,
					query: {
						siteSlug: 'example.wordpress.com',
						siteId: 123,
						from: 'https://site-to-be-migrated.com',
					},
				} );

				expect( window.location.assign ).toMatchURL( {
					path: '/overview/example.wordpress.com',
					query: {
						ref: 'site-migration',
					},
				} );
			} );
		} );

		describe( 'SITE_MIGRATION_OTHER_PLATFORM_DETECTED_IMPORT', () => {
			it( 'redirects to the importer flow using the detected platform', () => {
				runNavigation( {
					from: STEPS.SITE_MIGRATION_OTHER_PLATFORM_DETECTED_IMPORT,
					dependencies: {
						action: 'import',
						platform: 'squarespace',
					},
					query: {
						siteSlug: 'example.wordpress.com',
						from: 'oldsite.com',
						siteId: 123,
					},
				} );

				expect( window.location.assign ).toMatchURL( {
					path: '/setup/site-setup/importerSquarespace',
					query: {
						siteSlug: 'example.wordpress.com',
						from: 'oldsite.com',
						backToFlow: `site-migration/${ STEPS.SITE_MIGRATION_OTHER_PLATFORM_DETECTED_IMPORT.slug }`,
						siteId: 123,
						ref: 'site-migration',
					},
				} );
			} );

			it( 'redirects to the MIGRATION_SUPPORT_INSTRUCTIONS step when the user skips the import', () => {
				const destination = runNavigation( {
					from: STEPS.SITE_MIGRATION_OTHER_PLATFORM_DETECTED_IMPORT,
					query: {
						siteSlug: 'example.wordpress.com',
						siteId: 123,
						from: 'oldsite.com',
					},
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.SITE_MIGRATION_SUPPORT_INSTRUCTIONS,
					query: {
						siteSlug: 'example.wordpress.com',
						siteId: 123,
						from: 'oldsite.com',
					},
				} );
			} );
		} );

		describe( 'SITE_MIGRATION_APPLICATION_PASSWORD_AUTHORIZATION', () => {
			it( 'redirects to site overview when the user skips', () => {
				runNavigation( {
					from: STEPS.SITE_MIGRATION_APPLICATION_PASSWORD_AUTHORIZATION,
					dependencies: {
						action: 'skip',
					},
					query: {
						siteSlug: 'example.wordpress.com',
						siteId: 123,
						from: 'https://site-to-be-migrated.com',
					},
				} );

				expect( window.location.assign ).toMatchURL( {
					path: '/overview/example.wordpress.com',
					query: {
						ref: 'site-migration',
					},
				} );
			} );

			it( 'redirects to the SITE_MIGRATION_FALLBACK_CREDENTIALS when the fallback credential is required', () => {
				const destination = runNavigation( {
					from: STEPS.SITE_MIGRATION_APPLICATION_PASSWORD_AUTHORIZATION,
					dependencies: {
						action: 'fallback-credentials',
					},
					query: {
						siteSlug: 'example.wordpress.com',
						siteId: 123,
						from: 'http://oldsite.com',
					},
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.SITE_MIGRATION_FALLBACK_CREDENTIALS,
					query: {
						siteSlug: 'example.wordpress.com',
						siteId: 123,
						from: 'http://oldsite.com',
					},
				} );
			} );

			it( 'redirects to the overview when the user ask for help', () => {
				runNavigation( {
					from: STEPS.SITE_MIGRATION_APPLICATION_PASSWORD_AUTHORIZATION,
					dependencies: {
						action: 'skip',
					},
					query: {
						siteSlug: 'example.wordpress.com',
						siteId: 123,
						from: 'http://oldsite.com',
					},
				} );

				expect( window.location.assign ).toMatchURL( {
					path: '/overview/example.wordpress.com',
					query: {
						ref: 'site-migration',
					},
				} );
			} );

			// Security regression tests for DOTOBRD-680 (query-controlled authorizationUrl XSS).
			// Do not weaken these to make a change pass: authorizationUrl must only ever reach
			// window.location.assign() when it is an http(s) URL on the source (from) site.
			describe( 'authorization action', () => {
				const assignCalledWithScheme = ( scheme: string ) =>
					( window.location.assign as jest.Mock ).mock.calls.some( ( [ url ] ) =>
						String( url ).trim().toLowerCase().startsWith( scheme )
					);

				it( 'navigates to a valid same-source https authorization URL', () => {
					runNavigation( {
						from: STEPS.SITE_MIGRATION_APPLICATION_PASSWORD_AUTHORIZATION,
						dependencies: {
							action: 'authorization',
							authorizationUrl:
								'https://site-to-be-migrated.com/wp-admin/authorize-application.php?app_name=WordPress.com',
						},
						query: {
							siteSlug: 'example.wordpress.com',
							siteId: 123,
							from: 'https://site-to-be-migrated.com',
						},
					} );

					expect( window.location.assign ).toMatchURL( {
						path: 'https://site-to-be-migrated.com/wp-admin/authorize-application.php',
						query: {
							app_name: 'WordPress.com',
							ref: 'site-migration',
						},
					} );
				} );

				it( 'does not navigate to a javascript: authorization URL (XSS)', () => {
					runNavigation( {
						from: STEPS.SITE_MIGRATION_APPLICATION_PASSWORD_AUTHORIZATION,
						dependencies: {
							action: 'authorization',
							authorizationUrl: 'javascript:alert(document.domain)//',
						},
						query: {
							siteSlug: 'example.wordpress.com',
							siteId: 123,
							from: 'https://site-to-be-migrated.com',
						},
					} );

					expect( assignCalledWithScheme( 'javascript:' ) ).toBe( false );
					expect( window.location.assign ).toMatchURL( {
						path: '/overview/example.wordpress.com',
						query: {
							ref: 'site-migration',
						},
					} );
				} );

				it( 'does not navigate to a data: authorization URL', () => {
					runNavigation( {
						from: STEPS.SITE_MIGRATION_APPLICATION_PASSWORD_AUTHORIZATION,
						dependencies: {
							action: 'authorization',
							authorizationUrl: 'data:text/html,<script>alert(document.domain)</script>//',
						},
						query: {
							siteSlug: 'example.wordpress.com',
							siteId: 123,
							from: 'https://site-to-be-migrated.com',
						},
					} );

					expect( assignCalledWithScheme( 'data:' ) ).toBe( false );
					expect( window.location.assign ).toMatchURL( {
						path: '/overview/example.wordpress.com',
						query: {
							ref: 'site-migration',
						},
					} );
				} );

				it( 'does not navigate to an off-source https authorization URL', () => {
					runNavigation( {
						from: STEPS.SITE_MIGRATION_APPLICATION_PASSWORD_AUTHORIZATION,
						dependencies: {
							action: 'authorization',
							authorizationUrl: 'https://evil.example/wp-admin/authorize-application.php',
						},
						query: {
							siteSlug: 'example.wordpress.com',
							siteId: 123,
							from: 'https://site-to-be-migrated.com',
						},
					} );

					expect( window.location.assign ).toMatchURL( {
						path: '/overview/example.wordpress.com',
						query: {
							ref: 'site-migration',
						},
					} );
				} );

				it( 'does not navigate to a scheme-relative authorization URL', () => {
					runNavigation( {
						from: STEPS.SITE_MIGRATION_APPLICATION_PASSWORD_AUTHORIZATION,
						dependencies: {
							action: 'authorization',
							authorizationUrl: '//evil.example/wp-admin/authorize-application.php',
						},
						query: {
							siteSlug: 'example.wordpress.com',
							siteId: 123,
							from: 'https://site-to-be-migrated.com',
						},
					} );

					expect( window.location.assign ).toMatchURL( {
						path: '/overview/example.wordpress.com',
						query: {
							ref: 'site-migration',
						},
					} );
				} );

				it( 'does not navigate to a file: authorization URL', () => {
					runNavigation( {
						from: STEPS.SITE_MIGRATION_APPLICATION_PASSWORD_AUTHORIZATION,
						dependencies: {
							action: 'authorization',
							authorizationUrl: 'file:///etc/passwd//',
						},
						query: {
							siteSlug: 'example.wordpress.com',
							siteId: 123,
							from: 'https://site-to-be-migrated.com',
						},
					} );

					expect( assignCalledWithScheme( 'file:' ) ).toBe( false );
					expect( window.location.assign ).toMatchURL( {
						path: '/overview/example.wordpress.com',
						query: {
							ref: 'site-migration',
						},
					} );
				} );

				it( 'does not navigate when the source (from) is missing', () => {
					runNavigation( {
						from: STEPS.SITE_MIGRATION_APPLICATION_PASSWORD_AUTHORIZATION,
						dependencies: {
							action: 'authorization',
							authorizationUrl:
								'https://site-to-be-migrated.com/wp-admin/authorize-application.php?app_name=WordPress.com',
						},
						query: {
							siteSlug: 'example.wordpress.com',
							siteId: 123,
						},
					} );

					expect( window.location.assign ).toMatchURL( {
						path: '/overview/example.wordpress.com',
						query: {
							ref: 'site-migration',
						},
					} );
				} );
			} );
		} );

		describe( 'SITE_MIGRATION_ALREADY_WPCOM', () => {
			it( 'redirects to SITE_MIGRATION_SUPPORT_INSTRUCTIONS', () => {
				const destination = runNavigation( {
					from: STEPS.SITE_MIGRATION_ALREADY_WPCOM,
					query: {
						siteSlug: 'example.wordpress.com',
						siteId: 123,
					},
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.SITE_MIGRATION_SUPPORT_INSTRUCTIONS,
					query: {
						siteSlug: 'example.wordpress.com',
						siteId: 123,
					},
				} );
			} );
		} );
	} );
} );
