/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import config from '@automattic/calypso-config';
import { PLAN_BUSINESS_MONTHLY } from '@automattic/calypso-products';
import { isCurrentUserLoggedIn } from '@automattic/data-stores/src/user/selectors';
import { waitFor } from '@testing-library/react';
import nock from 'nock';
import { HOW_TO_MIGRATE_OPTIONS } from 'calypso/landing/stepper/constants';
import { useFlowState } from 'calypso/landing/stepper/declarative-flow/internals/state-manager/store';
import { STEPS } from 'calypso/landing/stepper/declarative-flow/internals/steps';
import {
	getAssertionConditionResult,
	getFlowLocation,
	renderFlow,
	runFlowNavigation,
} from 'calypso/landing/stepper/declarative-flow/test/helpers';
import { useIsSiteAdmin } from 'calypso/landing/stepper/hooks/use-is-site-admin';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
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
jest.mock( 'calypso/landing/stepper/hooks/use-site' );
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
		// These cases describe the WordPress path and the flag-off behaviour of the
		// non-WordPress one. The wizard has its own coverage and enables the flag itself.
		config.disable( 'migration/non-wordpress-source' );
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

			it( 'redirects to IMPORT_LIST when a site is selected and the platform is not identified', () => {
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

	describe( 'non-WordPress migration wizard', () => {
		const FROM = 'https://terraandtwine.com';
		const WIZARD_QUERY = { from: FROM, platform: 'wix' };
		const SITE_QUERY = { siteId: 123, siteSlug: 'example.wordpress.com' };

		let setFlowState: jest.Mock;

		const mockFlowState = ( state: Record< string, unknown > = {} ) => {
			setFlowState = jest.fn();
			jest.mocked( useFlowState ).mockReturnValue( {
				get: jest.fn( ( key: string ) => state[ key ] ),
				set: setFlowState,
				sessionId: '123',
			} );
		};

		const mockPaidSite = () =>
			jest.mocked( useSite ).mockReturnValue( {
				ID: 123,
				URL: 'https://example.wordpress.com',
				plan: { is_free: false, product_slug: PLAN_BUSINESS_MONTHLY },
			} );

		beforeEach( () => {
			config.enable( 'migration/non-wordpress-source' );
			jest.mocked( goToCheckout ).mockClear();
			jest.mocked( useSite ).mockReturnValue( undefined );
			mockFlowState();
		} );

		afterEach( () => {
			config.disable( 'migration/non-wordpress-source' );
			jest.mocked( useSite ).mockReturnValue( undefined );
		} );

		describe( 'with the flag off', () => {
			beforeEach( () => {
				config.disable( 'migration/non-wordpress-source' );
			} );

			it( 'still exits to the importer list for a platform with no dedicated importer', () => {
				runNavigation( {
					from: STEPS.SITE_MIGRATION_IDENTIFY,
					dependencies: { platform: 'non-wordpress-site', from: FROM },
					query: SITE_QUERY,
				} );

				expect( window.location.assign ).toMatchURL( {
					path: '/setup/site-setup/importList',
					query: { ...SITE_QUERY, from: FROM },
				} );
			} );

			it( 'still exits to the dedicated importer for an importable platform', () => {
				runNavigation( {
					from: STEPS.SITE_MIGRATION_IDENTIFY,
					dependencies: { platform: 'wix', from: FROM },
					query: SITE_QUERY,
				} );

				expect( window.location.assign ).toMatchURL( {
					path: '/setup/site-setup/importerWix',
					query: { siteSlug: 'example.wordpress.com', from: FROM },
				} );
			} );
		} );

		describe( 'SITE_MIGRATION_IDENTIFY', () => {
			it( 'sends a non-WordPress source into the destination step', () => {
				const destination = runNavigation( {
					from: STEPS.SITE_MIGRATION_IDENTIFY,
					dependencies: { platform: 'wix', from: FROM },
					query: SITE_QUERY,
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.SITE_MIGRATION_DESTINATION,
					query: { from: FROM, platform: 'wix' },
				} );
				expect( setFlowState ).toHaveBeenCalledWith( STEPS.SITE_MIGRATION_IDENTIFY.slug, {
					platform: 'wix',
					from: FROM,
				} );
			} );

			it( 'leaves the WordPress path on import-or-migrate', () => {
				const destination = runNavigation( {
					from: STEPS.SITE_MIGRATION_IDENTIFY,
					dependencies: { platform: 'wordpress', from: FROM },
					query: SITE_QUERY,
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.SITE_MIGRATION_IMPORT_OR_MIGRATE,
					query: { ...SITE_QUERY, from: FROM },
				} );
			} );

			it( 'keeps sending a platform picked from the list to the content importer', () => {
				runNavigation( {
					from: STEPS.SITE_MIGRATION_IDENTIFY,
					dependencies: {
						platform: 'wix',
						from: FROM,
						action: 'skip_platform_identification',
					},
					query: SITE_QUERY,
				} );

				expect( window.location.assign ).toMatchURL( {
					path: '/setup/site-setup/importerWix',
					query: { siteSlug: 'example.wordpress.com', from: FROM },
				} );
			} );
		} );

		describe( 'PROCESSING', () => {
			it( 'leaves the WordPress path on import-or-migrate', () => {
				const destination = runNavigation( {
					from: STEPS.PROCESSING,
					dependencies: { siteCreated: true, siteId: 123, siteSlug: 'example.wordpress.com' },
					query: { from: FROM, platform: 'wordpress' },
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.SITE_MIGRATION_IMPORT_OR_MIGRATE,
					query: { ...SITE_QUERY, from: FROM },
				} );
			} );

			it( 'goes to checkout with the site created off the back of the review step', () => {
				mockFlowState( { plans: { cartItems: [ { product_slug: PLAN_BUSINESS_MONTHLY } ] } } );

				runNavigation( {
					from: STEPS.PROCESSING,
					dependencies: {
						siteCreated: true,
						siteId: 123,
						siteSlug: 'example.wordpress.com',
						goToCheckout: true,
					},
					query: WIZARD_QUERY,
				} );

				expect( goToCheckout ).toHaveBeenCalledWith(
					expect.objectContaining( {
						destination: `/setup/site-migration/${
							STEPS.SITE_MIGRATION_IMPORT_PROGRESS.slug
						}?siteSlug=example.wordpress.com&siteId=123&from=${ encodeURIComponent( FROM ) }`,
						plan: PLAN_BUSINESS_MONTHLY,
					} )
				);
			} );

			it( 'goes to the import step when the site was created at the end of the wizard', () => {
				const destination = runNavigation( {
					from: STEPS.PROCESSING,
					dependencies: { siteCreated: true, siteId: 123, siteSlug: 'example.wordpress.com' },
					query: { ...WIZARD_QUERY, wizardComplete: 'true' },
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.SITE_MIGRATION_IMPORT_PROGRESS,
					query: { ...SITE_QUERY, from: FROM },
				} );
			} );

			it( 'starts the wizard when the site was created before it ran', () => {
				const destination = runNavigation( {
					from: STEPS.PROCESSING,
					dependencies: { siteCreated: true, siteId: 123, siteSlug: 'example.wordpress.com' },
					query: WIZARD_QUERY,
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.SITE_MIGRATION_DESTINATION,
					query: { ...SITE_QUERY, ...WIZARD_QUERY },
				} );
			} );
		} );

		describe( 'the wizard chain', () => {
			it( 'goes from destination to domain', () => {
				const destination = runNavigation( {
					from: STEPS.SITE_MIGRATION_DESTINATION,
					dependencies: { destination: 'wpcom' },
					query: WIZARD_QUERY,
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.SITE_MIGRATION_DOMAIN,
					query: WIZARD_QUERY,
				} );
			} );

			it( 'goes from domain to plans', () => {
				const destination = runNavigation( {
					from: STEPS.SITE_MIGRATION_DOMAIN,
					dependencies: { choice: 'free-subdomain' },
					query: WIZARD_QUERY,
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.UNIFIED_PLANS,
					query: WIZARD_QUERY,
				} );
			} );

			it( 'persists the chosen plan and goes from plans to SEO', () => {
				const cartItems = [ { product_slug: PLAN_BUSINESS_MONTHLY } ];

				const destination = runNavigation( {
					from: STEPS.UNIFIED_PLANS,
					dependencies: { stepName: 'plans', cartItems },
					query: WIZARD_QUERY,
				} );

				expect( setFlowState ).toHaveBeenCalledWith( STEPS.UNIFIED_PLANS.slug, {
					stepName: 'plans',
					cartItems,
				} );
				expect( destination ).toMatchDestination( {
					step: STEPS.SITE_MIGRATION_SEO,
					query: WIZARD_QUERY,
				} );
			} );

			it( 'goes from SEO to review', () => {
				const destination = runNavigation( {
					from: STEPS.SITE_MIGRATION_SEO,
					query: WIZARD_QUERY,
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.SITE_MIGRATION_REVIEW,
					query: WIZARD_QUERY,
				} );
			} );
		} );

		describe( 'the domain detours', () => {
			it( 'sends the register choice to the domain search step', () => {
				const destination = runNavigation( {
					from: STEPS.SITE_MIGRATION_DOMAIN,
					dependencies: { choice: 'register' },
					query: WIZARD_QUERY,
				} );

				expect( destination ).toMatchDestination( { step: STEPS.DOMAIN_SEARCH, query: null } );
			} );

			it( 'sends the keep choice to the use-my-domain step', () => {
				const destination = runNavigation( {
					from: STEPS.SITE_MIGRATION_DOMAIN,
					dependencies: { choice: 'keep' },
					query: WIZARD_QUERY,
				} );

				expect( destination ).toMatchDestination( { step: STEPS.USE_MY_DOMAIN, query: null } );
			} );

			it( 'rejoins the wizard at plans once the domain is settled', () => {
				const destination = runNavigation( {
					from: STEPS.USE_MY_DOMAIN,
					query: WIZARD_QUERY,
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.UNIFIED_PLANS,
					query: WIZARD_QUERY,
				} );
			} );
		} );

		describe( 'the exits', () => {
			it( 'dead-ends Space Fast at a placeholder', () => {
				const destination = runNavigation( {
					from: STEPS.SITE_MIGRATION_DESTINATION,
					dependencies: { destination: 'space-fast' },
					query: WIZARD_QUERY,
				} );

				expect( destination ).toMatchDestination( { step: STEPS.ERROR, query: null } );
				expect( getFlowLocation().state ).toEqual( {
					message: 'Space Fast is not available yet',
				} );
			} );
		} );

		describe( 'SITE_MIGRATION_REVIEW', () => {
			it( 'starts checkout with a destination that lands on the import progress step', () => {
				mockFlowState( { plans: { cartItems: [ { product_slug: PLAN_BUSINESS_MONTHLY } ] } } );

				runNavigation( {
					from: STEPS.SITE_MIGRATION_REVIEW,
					dependencies: { action: 'migrate' },
					query: { from: FROM, platform: 'wix', ...SITE_QUERY },
				} );

				expect( goToCheckout ).toHaveBeenCalledWith( {
					flowName: 'site-migration',
					stepName: STEPS.SITE_MIGRATION_REVIEW.slug,
					siteSlug: 'example.wordpress.com',
					destination: `/setup/site-migration/${
						STEPS.SITE_MIGRATION_IMPORT_PROGRESS.slug
					}?siteSlug=example.wordpress.com&siteId=123&from=${ encodeURIComponent( FROM ) }`,
					from: FROM,
					plan: PLAN_BUSINESS_MONTHLY,
					historyBack: true,
				} );
			} );

			it( 'creates the destination site first when there is not one yet', () => {
				const destination = runNavigation( {
					from: STEPS.SITE_MIGRATION_REVIEW,
					dependencies: { action: 'migrate' },
					query: WIZARD_QUERY,
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.SITE_CREATION_STEP,
					query: { ...WIZARD_QUERY, wizardComplete: 'true' },
				} );
				expect( goToCheckout ).not.toHaveBeenCalled();
			} );
		} );

		describe( 'a destination site already on a paid plan', () => {
			it( 'skips the plans step', () => {
				mockPaidSite();

				const destination = runNavigation( {
					from: STEPS.SITE_MIGRATION_DOMAIN,
					dependencies: { choice: 'free-subdomain' },
					query: { ...WIZARD_QUERY, ...SITE_QUERY },
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.SITE_MIGRATION_SEO,
					query: WIZARD_QUERY,
				} );
			} );

			it( 'skips checkout and goes straight to the import progress step', () => {
				mockPaidSite();

				const destination = runNavigation( {
					from: STEPS.SITE_MIGRATION_REVIEW,
					dependencies: { action: 'migrate' },
					query: { ...WIZARD_QUERY, ...SITE_QUERY },
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.SITE_MIGRATION_IMPORT_PROGRESS,
					query: { ...SITE_QUERY, from: FROM },
				} );
				expect( goToCheckout ).not.toHaveBeenCalled();
			} );
		} );
	} );
} );
