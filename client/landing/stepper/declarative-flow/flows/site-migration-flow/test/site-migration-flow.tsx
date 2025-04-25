/**
 * @jest-environment jsdom
 */
import { PLAN_MIGRATION_TRIAL_MONTHLY } from '@automattic/calypso-products';
import { isCurrentUserLoggedIn } from '@automattic/data-stores/src/user/selectors';
import { waitFor } from '@testing-library/react';
import nock from 'nock';
import { HOSTING_INTENT_MIGRATE } from 'calypso/data/hosting/use-add-hosting-trial-mutation';
import { HOW_TO_MIGRATE_OPTIONS } from 'calypso/landing/stepper/constants';
import { useFlowState } from 'calypso/landing/stepper/declarative-flow/internals/state-manager/store';
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

const runNavigationBack = ( options: Parameters< typeof runFlowNavigation >[ 1 ] ) =>
	runFlowNavigation( siteMigrationFlow, options, 'back' );

describe( 'Site Migration Flow', () => {
	beforeAll( () => {
		Object.defineProperty( window, 'location', {
			value: { ...originalLocation, assign: jest.fn() },
		} );
	} );

	afterAll( () => {
		Object.defineProperty( window, 'location', originalLocation );
	} );

	beforeEach( () => {
		( window.location.assign as jest.Mock ).mockClear();
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

			nock( 'https://public-api.wordpress.com' )
				.post( '/wpcom/v2/guides/trigger', {
					flow: 'site-migration',
					step: 'site-migration-import-or-migrate',
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
			it( 'redirects to SITE_MIGRATION_IMPORT_OR_MIGRATE when the platform is wordpress', () => {
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
					step: STEPS.SITE_MIGRATION_IMPORT_OR_MIGRATE,
					query: {
						siteId: 123,
						siteSlug: 'example.wordpress.com',
						from: 'https://site-to-be-migrated.com',
					},
				} );
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

			it( 'redirects to the import flow if there is no from query parameter', () => {
				runNavigation( {
					from: STEPS.PROCESSING,
					dependencies: {
						siteCreated: true,
						siteId: 123,
						siteSlug: 'example.wordpress.com',
					},
				} );

				expect( window.location.assign ).toMatchURL( {
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

				expect( window.location.assign ).toMatchURL( {
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

			it( 'redirects to IMPORT_OR_MIGRATE when there is a destination site (siteSlug/siteId) and platform is wordpress', async () => {
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
					step: STEPS.SITE_MIGRATION_IMPORT_OR_MIGRATE,
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

			it( 'redirects to IMPORT_OR_MIGRATE when there is a destination site (siteSlug/siteId) and platform wordpress', async () => {
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
					step: STEPS.SITE_MIGRATION_IMPORT_OR_MIGRATE,
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

			describe( 'back', () => {
				beforeEach( () => {
					jest.clearAllMocks();
				} );

				it( 'redirects back to SITE_MIGRATION_IDENTIFY step', () => {
					runNavigationBack( {
						from: STEPS.SITE_MIGRATION_IDENTIFY,
						dependencies: {},
						query: { siteSlug: 'example.wordpress.com', siteId: 123 },
					} );

					expect( window.location.assign ).toMatchURL( {
						path: '/setup/site-setup/goals',
						query: {
							siteSlug: 'example.wordpress.com',
							siteId: 123,
						},
					} );
				} );

				it( 'redirects back to the importer list when the entry point is wp-admin-importers-list', () => {
					jest.mocked( useFlowState ).mockReturnValue( {
						get: jest.fn().mockReturnValue( { entryPoint: 'wp-admin-importers-list' } ),
						set: jest.fn(),
						sessionId: '123',
					} );

					runNavigationBack( {
						from: STEPS.SITE_MIGRATION_IDENTIFY,
						dependencies: {},
						query: {
							siteSlug: 'example.wordpress.com',
							siteId: 123,
						},
					} );

					expect( window.location.assign ).toMatchURL( {
						path: 'https://example.wpcomstaging.com/wp-admin/import.php',
					} );
				} );
			} );
		} );

		describe( 'SITE_MIGRATION_IMPORT_OR_MIGRATE', () => {
			beforeEach( () => {
				jest.clearAllMocks();
			} );

			it( 'redirects to SITE_MIGRATION_HOW_TO_MIGRATE step', () => {
				const destination = runNavigation( {
					from: STEPS.SITE_MIGRATION_IMPORT_OR_MIGRATE,
					dependencies: {},
					query: { siteSlug: 'example.wordpress.com', siteId: 123 },
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.SITE_MIGRATION_HOW_TO_MIGRATE,
					query: {
						siteSlug: 'example.wordpress.com',
						siteId: 123,
					},
				} );
			} );

			it( 'redirects to the import flow when the user chooses to import', () => {
				runNavigation( {
					from: STEPS.SITE_MIGRATION_IMPORT_OR_MIGRATE,
					dependencies: {
						destination: 'import',
					},
					query: {
						siteSlug: 'example.wordpress.com',
						siteId: 123,
						from: 'https://site-to-be-migrated.com',
					},
				} );

				expect( window.location.assign ).toMatchURL( {
					path: '/setup/site-setup/importerWordpress',
					query: {
						siteSlug: 'example.wordpress.com',
						siteId: 123,
						backToFlow: '/site-migration/site-migration-import-or-migrate',
						from: 'https://site-to-be-migrated.com',
					},
				} );
			} );

			it( 'redirects to regular import page when coming from there (entryPoint=calypso-importer)', () => {
				jest.mocked( useFlowState ).mockReturnValue( {
					get: jest.fn().mockReturnValue( { entryPoint: 'calypso-importer' } ),
					set: jest.fn(),
					sessionId: '123',
				} );

				runNavigation( {
					from: STEPS.SITE_MIGRATION_IMPORT_OR_MIGRATE,
					dependencies: {
						destination: 'import',
					},
					query: {
						siteSlug: 'site-to-be-migrated.com',
					},
				} );

				expect( window.location.assign ).toMatchURL( {
					path: '/import/site-to-be-migrated.com',
					query: {
						engine: 'wordpress',
						ref: 'site-migration',
					},
				} );
			} );

			describe( 'back', () => {
				beforeEach( () => {
					jest.clearAllMocks();
				} );

				it( 'redirects back to the SITE_MIGRATION_IDENTIFY step', () => {
					jest.mocked( useFlowState ).mockReturnValue( {
						get: jest.fn().mockReturnValueOnce( {} ),
						set: jest.fn(),
						sessionId: '123',
					} );

					const destination = runNavigationBack( {
						from: STEPS.SITE_MIGRATION_IMPORT_OR_MIGRATE,
						dependencies: {},
						query: { siteSlug: 'example.wordpress.com', siteId: 123 },
					} );

					expect( destination ).toMatchDestination( {
						step: STEPS.SITE_MIGRATION_IDENTIFY,
					} );
				} );

				it( 'redirects back to import flow when the ref is calypso-importer', () => {
					jest.mocked( useFlowState ).mockReturnValue( {
						get: jest.fn().mockReturnValue( { entryPoint: 'calypso-importer' } ),
						set: jest.fn(),
						sessionId: '123',
					} );
					runNavigationBack( {
						from: STEPS.SITE_MIGRATION_IMPORT_OR_MIGRATE,
						dependencies: {},
						query: { siteSlug: 'example.wordpress.com', siteId: 123, ref: 'calypso-importer' },
					} );

					expect( window.location.assign ).toMatchURL( {
						path: '/import/example.wordpress.com',
						query: {
							ref: 'site-migration',
						},
					} );
				} );
			} );
		} );

		describe( 'PICK_SITE', () => {
			it( 'redirects to IMPORT_OR_MIGRATE when a site is selected', () => {
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
					step: STEPS.SITE_MIGRATION_IMPORT_OR_MIGRATE,
					query: {
						siteSlug: 'example.wordpress.com',
						siteId: 123,
					},
				} );
			} );

			it( 'redirects to IMPORT_OR_MIGRATE when a site is selected and the platform is not identified', () => {
				const destination = runNavigation( {
					from: STEPS.PICK_SITE,
					dependencies: {
						action: 'select-site',
						site: {
							ID: 123,
							slug: 'example.wordpress.com',
						},
					},
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.SITE_MIGRATION_IMPORT_OR_MIGRATE,
					query: {
						siteSlug: 'example.wordpress.com',
						siteId: 123,
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

			describe( 'back', () => {
				it( 'redirects back to SITE_MIGRATION_IMPORT_OR_MIGRATE step', () => {
					const destination = runNavigationBack( {
						from: STEPS.SITE_MIGRATION_HOW_TO_MIGRATE,
						dependencies: {},
						query: { siteSlug: 'example.wordpress.com', siteId: 123 },
					} );

					expect( destination ).toMatchDestination( {
						step: STEPS.SITE_MIGRATION_IMPORT_OR_MIGRATE,
					} );
				} );
			} );
		} );

		describe( 'SITE_MIGRATION_UPGRADE_PLAN', () => {
			it( 'redirects the user to the checkout page with the correct destination parameters', () => {
				runNavigation( {
					from: STEPS.SITE_MIGRATION_UPGRADE_PLAN,
					dependencies: {
						goToCheckout: true,
						plan: PLAN_MIGRATION_TRIAL_MONTHLY,
						sendIntentWhenCreatingTrial: true,
					},
					query: {
						siteSlug: 'example.wordpress.com',
						siteId: 123,
						from: 'https://site-to-be-migrated.com',
					},
				} );

				expect( goToCheckout ).toHaveBeenCalledWith( {
					destination: `/setup/site-migration/${ STEPS.SITE_MIGRATION_INSTRUCTIONS.slug }?siteSlug=example.wordpress.com&from=https%3A%2F%2Fsite-to-be-migrated.com&siteId=123`,
					extraQueryParams: { hosting_intent: HOSTING_INTENT_MIGRATE },
					flowName: 'site-migration',
					from: 'https://site-to-be-migrated.com',
					siteSlug: 'example.wordpress.com',
					stepName: STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug,
					cancelDestination: `/setup/site-migration/${ STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug }?siteSlug=example.wordpress.com&siteId=123&from=https%3A%2F%2Fsite-to-be-migrated.com`,
					plan: PLAN_MIGRATION_TRIAL_MONTHLY,
				} );
			} );

			describe( 'back', () => {
				it( 'redirects back to SITE_MIGRATION_HOW_TO_MIGRATE step', () => {
					const destination = runNavigationBack( {
						from: STEPS.SITE_MIGRATION_UPGRADE_PLAN,
						dependencies: {},
						query: { siteSlug: 'example.wordpress.com', siteId: 123 },
					} );

					expect( destination ).toMatchDestination( {
						step: STEPS.SITE_MIGRATION_HOW_TO_MIGRATE,
					} );
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

			describe( 'back', () => {
				it( 'redirects back to SITE_MIGRATION_HOW_TO_MIGRATE step', () => {
					const destination = runNavigationBack( {
						from: STEPS.SITE_MIGRATION_CREDENTIALS,
						dependencies: {},
						query: { siteSlug: 'example.wordpress.com', siteId: 123 },
					} );

					expect( destination ).toMatchDestination( {
						step: STEPS.SITE_MIGRATION_HOW_TO_MIGRATE,
						query: { siteSlug: 'example.wordpress.com', siteId: 123 },
					} );
				} );

				it( 'redirects to WooCommerce admin when we were referred from the entrepreneur flow', () => {
					( useFlowState as jest.Mock ).mockReturnValue( {
						get: jest.fn().mockReturnValue( {
							entryPoint: 'entrepreneur-signup',
						} ),
						set: jest.fn(),
						sessionId: '12345',
					} );

					runNavigationBack( {
						from: STEPS.SITE_MIGRATION_CREDENTIALS,
						dependencies: {},
						query: {
							siteSlug: 'example.wpcomstaging.com',
							siteId: 123,
							ref: 'entrepreneur-signup',
						},
					} );

					expect( window.location.assign ).toHaveBeenCalledWith(
						'https://example.wpcomstaging.com/wp-admin/admin.php?page=wc-admin&from-calypso=&sessionId=12345'
					);
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

			describe( 'back', () => {
				it( 'redirects back to SITE_MIGRATION_CREDENTIALS', () => {
					const destination = runNavigationBack( {
						from: STEPS.SITE_MIGRATION_FALLBACK_CREDENTIALS,
						dependencies: {},
						query: { siteSlug: 'example.wordpress.com', siteId: 123 },
					} );

					expect( destination ).toMatchDestination( {
						step: STEPS.SITE_MIGRATION_CREDENTIALS,
						query: { siteSlug: 'example.wordpress.com', siteId: 123 },
					} );
				} );

				it( 'redirects back to SITE_MIGRATION_APPLICATION_PASSWORD_AUTHORIZATION when query backTo is set to this step', () => {
					const destination = runNavigationBack( {
						from: STEPS.SITE_MIGRATION_FALLBACK_CREDENTIALS,
						dependencies: {},
						query: {
							siteSlug: 'example.wordpress.com',
							siteId: 123,
							backTo: STEPS.SITE_MIGRATION_APPLICATION_PASSWORD_AUTHORIZATION.slug,
						},
					} );

					expect( destination ).toMatchDestination( {
						step: STEPS.SITE_MIGRATION_APPLICATION_PASSWORD_AUTHORIZATION,
						query: { siteSlug: 'example.wordpress.com', siteId: 123 },
					} );
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

			describe( 'back', () => {
				it( 'redirects back to the SITE_MIGRATION_CREDENTIALS', () => {
					const destination = runNavigationBack( {
						from: STEPS.SITE_MIGRATION_OTHER_PLATFORM_DETECTED_IMPORT,
						dependencies: {},
						query: { siteSlug: 'example.wordpress.com', siteId: 123, from: 'oldsite.com' },
					} );

					expect( destination ).toMatchDestination( {
						step: STEPS.SITE_MIGRATION_CREDENTIALS,
						query: {
							siteSlug: 'example.wordpress.com',
							siteId: 123,
							from: 'oldsite.com',
						},
					} );
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

			describe( 'back', () => {
				it( 'redirects back to the SITE_MIGRATION_CREDENTIALS', () => {
					const destination = runNavigationBack( {
						from: STEPS.SITE_MIGRATION_APPLICATION_PASSWORD_AUTHORIZATION,
						dependencies: {},
						query: { siteSlug: 'example.wordpress.com', siteId: 123 },
					} );

					expect( destination ).toMatchDestination( {
						step: STEPS.SITE_MIGRATION_CREDENTIALS,
						query: { siteSlug: 'example.wordpress.com', siteId: 123 },
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
