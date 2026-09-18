/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import config from '@automattic/calypso-config';
import { PLAN_BUSINESS_MONTHLY } from '@automattic/calypso-products';
import { isCurrentUserLoggedIn } from '@automattic/data-stores/src/user/selectors';
import { waitFor } from '@testing-library/react';
import nock from 'nock';
import { MemoryRouter } from 'react-router';
import { HOW_TO_MIGRATE_OPTIONS } from 'calypso/landing/stepper/constants';
import { STEPS } from 'calypso/landing/stepper/declarative-flow/internals/steps';
import {
	getAssertionConditionResult,
	renderFlow,
	runFlowNavigation,
} from 'calypso/landing/stepper/declarative-flow/test/helpers';
import { useIsSiteAdmin } from 'calypso/landing/stepper/hooks/use-is-site-admin';
import { goToCheckout } from 'calypso/landing/stepper/utils/checkout';
import { getCurrentUserSiteCount } from 'calypso/state/current-user/selectors';
import getSiteOption from 'calypso/state/sites/selectors/get-site-option';
import { renderHookWithProvider } from 'calypso/test-helpers/testing-library';
import { useRecordSignupComplete } from '../../../../hooks/use-record-signup-complete';
import siteMigrationFlow from '../site-migration-flow';
// we need to save the original object for later to not affect tests from other files
const originalLocation = window.location;

jest.mock( 'calypso/landing/stepper/utils/checkout' );
jest.mock( '@automattic/data-stores/src/user/selectors' );
jest.mock( 'calypso/state/current-user/selectors' );
jest.mock( 'calypso/landing/stepper/hooks/use-is-site-admin' );
jest.mock( 'calypso/lib/guides/trigger-guides-for-step', () => ( {
	triggerGuidesForStep: jest.fn(),
} ) );

jest.mock( 'calypso/landing/stepper/declarative-flow/internals/state-manager/store', () => ( {
	useFlowState: jest.fn().mockReturnValue( {
		get: jest.fn(),
		set: jest.fn(),
		sessionId: '123',
	} ),
} ) );

jest.mock( 'calypso/state/sites/selectors/get-site-option' );
jest.mock( 'calypso/landing/stepper/hooks/use-record-signup-complete', () => ( {
	useRecordSignupComplete: jest.fn().mockReturnValue( jest.fn() ),
} ) );

const runNavigation = ( options: Parameters< typeof runFlowNavigation >[ 1 ] ) =>
	runFlowNavigation( siteMigrationFlow, options, 'forward' );

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

		const apiBaseUrl = 'https://public-api.wordpress.com';
		const testSettingsEndpoint = '/rest/v1.4/sites/example.wordpress.com/settings';
		nock( apiBaseUrl ).get( testSettingsEndpoint ).reply( 200, {} );
		nock( apiBaseUrl ).post( testSettingsEndpoint ).reply( 200, {} );
		nock( apiBaseUrl ).post( '/wpcom/v2/guides/trigger' ).reply( 200, {} );
	} );

	afterEach( () => {
		// Restore the original implementation after each test
		jest.restoreAllMocks();
	} );

	describe( 'initialize', () => {
		afterEach( () => {
			Object.assign( window.location, { pathname: '/', search: '', hash: '' } );
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
									'/processing?platform=wordpress&from=https%3A%2F%2Fsource.com',
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

		//TODO: Move it to the top be the first test group to follow the order of the flow
		describe( 'SITE_MIGRATION_IDENTIFY', () => {
			beforeEach( () => {
				jest.clearAllMocks();
			} );

			it( 'redirects to site CREATE_SITE step when there is no destination site (siteSlug/siteId)', async () => {
				const destination = runNavigation( {
					from: STEPS.SITE_MIGRATION_IDENTIFY,
					dependencies: {
						from: 'https://example-to-be-migrated.com',
					},
				} );

				await waitFor( () => {
					expect( destination ).toMatchDestination( {
						step: STEPS.SITE_CREATION_STEP,
						query: {
							from: 'https://example-to-be-migrated.com',
						},
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

			describe( 'with the static-site import flow enabled', () => {
				beforeEach( () => {
					config.enable( 'migration/non-wordpress-source' );
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
							step: STEPS.SITE_CREATION_STEP,
							query: { from: 'https://site-to-be-migrated.com' },
						} );
					} );
				} );
			} );
		} );

		describe( 'PICK_SITE', () => {
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
				const destination = runNavigation( {
					from: STEPS.PICK_SITE,
					query: {
						action: 'migrate',
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
			it( 'redirects to the importer when the platform is importable', () => {
				runNavigation( {
					from: STEPS.PICK_SITE,
					dependencies: {
						action: 'select-site',
						site: { ID: 123, slug: 'example.wordpress.com' },
					},
					query: {
						platform: 'squarespace',
						from: 'https://site-to-be-migrated.com',
						siteId: 123,
						siteSlug: 'example.wordpress.com',
					},
				} );

				expect( window.location.assign ).toMatchURL( {
					path: '/setup/site-setup/importerSquarespace',
					query: {
						from: 'https://site-to-be-migrated.com',
						siteSlug: 'example.wordpress.com',
						sessionId: '123',
					},
				} );
			} );
		} );

		describe( 'SITE_MIGRATION_HOW_TO_MIGRATE', () => {
			it.each( [ undefined, 'https://source.example.com' ] )(
				'opens the WordPress file importer with source %s and a return path to the offer',
				( from ) => {
					runNavigation( {
						from: STEPS.SITE_MIGRATION_HOW_TO_MIGRATE,
						dependencies: { destination: 'import' },
						query: {
							siteId: 123,
							siteSlug: 'example.wordpress.com',
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
				const destination = runNavigation( {
					from: STEPS.SITE_MIGRATION_HOW_TO_MIGRATE,
					dependencies: {
						how: HOW_TO_MIGRATE_OPTIONS.DO_IT_MYSELF,
					},
					query: {
						siteSlug: 'example.wordpress.com',
					},
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.SITE_MIGRATION_INSTRUCTIONS,
					query: {
						siteSlug: 'example.wordpress.com',
					},
				} );
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
