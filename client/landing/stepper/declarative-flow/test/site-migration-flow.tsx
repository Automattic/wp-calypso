/**
 * @jest-environment jsdom
 */
import { PLAN_MIGRATION_TRIAL_MONTHLY } from '@automattic/calypso-products';
import { isCurrentUserLoggedIn } from '@automattic/data-stores/src/user/selectors';
import { waitFor } from '@testing-library/react';
import nock from 'nock';
import { HOSTING_INTENT_MIGRATE } from 'calypso/data/hosting/use-add-hosting-trial-mutation';
import { useIsSiteAdmin } from 'calypso/landing/stepper/hooks/use-is-site-admin';
import { GUIDED_ONBOARDING_FLOW_REFERRER } from '../../../../signup/steps/initial-intent/constants';
import { HOW_TO_MIGRATE_OPTIONS } from '../../constants';
import { goToCheckout } from '../../utils/checkout';
import { STEPS } from '../internals/steps';
import siteMigrationFlow from '../site-migration-flow';
import {
	getAssertionConditionResult,
	getFlowLocation,
	renderFlow,
	runFlowNavigation,
} from './helpers';
// we need to save the original object for later to not affect tests from other files
const originalLocation = window.location;

jest.mock( '../../utils/checkout' );
jest.mock( '@automattic/data-stores/src/user/selectors' );
jest.mock( 'calypso/landing/stepper/hooks/use-is-site-admin' );
jest.mock( 'calypso/lib/guides/trigger-guides-for-step', () => ( {
	triggerGuidesForStep: jest.fn(),
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

	describe( 'useAssertConditions', () => {
		it( 'redirects the user to home when there is not siteSlug and SiteID', () => {
			const { runUseAssertionCondition } = renderFlow( siteMigrationFlow );

			runUseAssertionCondition( {
				currentStep: STEPS.SITE_MIGRATION_IDENTIFY.slug,
				currentURL: `/setup/${ STEPS.SITE_MIGRATION_IDENTIFY.slug }?siteSlug=&siteId=`,
			} );

			expect( window.location.assign ).toHaveBeenCalledWith( '/' );
		} );

		it( 'redirects the user to the start page when the user is not the site admin', () => {
			const { runUseAssertionCondition } = renderFlow( siteMigrationFlow );
			( useIsSiteAdmin as jest.Mock ).mockReturnValue( { isAdmin: false } );

			runUseAssertionCondition( {
				currentStep: STEPS.SITE_MIGRATION_IDENTIFY.slug,
			} );

			expect( window.location.assign ).toHaveBeenCalledWith( '/start' );
		} );

		it( 'renders the step with success', () => {
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

		describe( 'SITE_MIGRATION_IDENTIFY', () => {
			beforeEach( () => jest.clearAllMocks() );

			it( 'redirects the user to the migrate or import page when the platform is wordpress', async () => {
				const destination = runNavigation( {
					from: STEPS.SITE_MIGRATION_IDENTIFY,
					dependencies: {
						action: 'continue',
						platform: 'wordpress',
						from: 'https://site-to-be-migrated.com',
					},
					query: { siteId: 123, siteSlug: 'example.wordpress.com' },
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

			it( 'redirects the user to the import content flow when was not possible to identify the platform', async () => {
				runNavigation( {
					from: STEPS.SITE_MIGRATION_IDENTIFY,
					dependencies: {
						action: 'continue',
						platform: 'unknown',
						from: 'https://example-to-be-migrated.com',
					},
					query: { siteId: 123, siteSlug: 'example.wordpress.com' },
				} );

				await waitFor( () => {
					expect( window.location.assign ).toMatchURL( {
						path: '/setup/site-setup/importList',
						query: {
							siteId: 123,
							siteSlug: 'example.wordpress.com',
							from: 'https://example-to-be-migrated.com',
						},
					} );
				} );
			} );

			it( 'redirects the user to the import content flow when the user skip the platform identification', async () => {
				runNavigation( {
					from: STEPS.SITE_MIGRATION_IDENTIFY,
					dependencies: {
						action: 'skip_platform_identification',
					},
					query: { siteId: 123, siteSlug: 'example.wordpress.com' },
				} );

				await waitFor( () => {
					expect( window.location.assign ).toMatchURL( {
						path: '/setup/site-setup/importList',
						query: {
							siteSlug: 'example.wordpress.com',
							origin: 'site-migration-identify',
							backToFlow: '/site-migration/site-migration-identify',
						},
					} );
				} );
			} );

			describe( 'back', () => {
				it( 'redirects back to the identify step', () => {
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

				it( 'redirects back to initial-intent when the ref is GUIDED_ONBOARDING_FLOW_REFERRER', () => {
					runNavigationBack( {
						from: STEPS.SITE_MIGRATION_IDENTIFY,
						dependencies: {},
						query: {
							siteSlug: 'example.wordpress.com',
							siteId: 123,
							ref: GUIDED_ONBOARDING_FLOW_REFERRER,
						},
					} );

					expect( window.location.assign ).toMatchURL( {
						path: '/start/initial-intent',
					} );
				} );
			} );
		} );

		describe( 'SITE_MIGRATION_IMPORT_OR_MIGRATE', () => {
			it( 'redirects to how-to-migrate page', () => {
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

			it( 'redirects to the import flow when the user choose to import', () => {
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
						option: 'content',
					},
				} );
			} );

			it( 'redirects to regular import page when they come from there (ref=calypso-importer)', () => {
				runNavigation( {
					from: STEPS.SITE_MIGRATION_IMPORT_OR_MIGRATE,
					dependencies: {
						destination: 'import',
					},
					query: {
						ref: 'calypso-importer',
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
				it( 'redirects back to the identify step', () => {
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

		describe( 'SITE_MIGRATION_HOW_TO_MIGRATE', () => {
			it( 'redirects to site-migration-upgrade-plan step when upgrade is required', () => {
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

			it( 'redirects to credentials step when DIFM is selected', () => {
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

			it( 'redirects to instructions page when myself is selected', () => {
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

			it( 'migrate redirects from the how-to-migrate (do it for me) page to credential collection step', () => {
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
				it( 'redirects back to the identify step', () => {
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
			it( 'redirects the user to the checkout page with the correct destination params', () => {
				runNavigation( {
					from: STEPS.SITE_MIGRATION_UPGRADE_PLAN,
					dependencies: {
						goToCheckout: true,
						plan: PLAN_MIGRATION_TRIAL_MONTHLY,
						sendIntentWhenCreatingTrial: true,
					},
					query: {
						siteSlug: 'example.wordpress.com',
						from: 'https://site-to-be-migrated.com',
					},
				} );

				expect( goToCheckout ).toHaveBeenCalledWith( {
					destination: `/setup/site-migration/${ STEPS.SITE_MIGRATION_INSTRUCTIONS.slug }?siteSlug=example.wordpress.com&from=https%3A%2F%2Fsite-to-be-migrated.com`,
					extraQueryParams: { hosting_intent: HOSTING_INTENT_MIGRATE },
					flowName: 'site-migration',
					siteSlug: 'example.wordpress.com',
					stepName: STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug,
					cancelDestination: `/setup/site-migration/${ STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug }?siteSlug=example.wordpress.com&from=https%3A%2F%2Fsite-to-be-migrated.com`,
					plan: PLAN_MIGRATION_TRIAL_MONTHLY,
				} );
			} );

			describe( 'back', () => {
				it( 'redirects back to the how-to-migrate step', () => {
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
			it( 'redirects to the migration started step when the migration is started', () => {
				const destination = runNavigation( {
					from: STEPS.SITE_MIGRATION_INSTRUCTIONS,
					dependencies: {
						destination: 'migration-started',
					},
					query: {
						siteSlug: 'example.wordpress.com',
						siteId: 123,
						from: 'https://site-to-be-migrated.com',
					},
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.SITE_MIGRATION_STARTED,
					query: {
						siteSlug: 'example.wordpress.com',
						siteId: 123,
						from: 'https://site-to-be-migrated.com',
					},
				} );
			} );
		} );

		describe( 'SITE_MIGRATION_ASSISTED_MIGRATION', () => {
			it( 'redirects back to the credentials step when failing to create the ticket', () => {
				const destination = runNavigation( {
					from: STEPS.SITE_MIGRATION_ASSISTED_MIGRATION,
					dependencies: {
						hasError: 'ticket-creation',
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
						error: 'ticket-creation',
					},
				} );
			} );
		} );

		describe( 'SITE_MIGRATION_CREDENTIALS', () => {
			it( 'redirects the user to the instructions page when the user submits the credentials step', () => {
				const destination = runNavigation( {
					from: STEPS.SITE_MIGRATION_CREDENTIALS,
					dependencies: {},
					query: {
						siteSlug: 'example.wordpress.com',
						siteId: 123,
						from: 'https://site-to-be-migrated.com',
					},
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.SITE_MIGRATION_ASSISTED_MIGRATION,
					query: {
						siteSlug: 'example.wordpress.com',
						siteId: 123,
						from: 'https://site-to-be-migrated.com',
					},
				} );
			} );

			it( 'redirects to the instructions step when user skips the form and enables the ticket creation', () => {
				const destination = runNavigation( {
					from: STEPS.SITE_MIGRATION_CREDENTIALS,
					dependencies: {
						action: 'skip',
					},
					query: {
						siteSlug: 'example.wordpress.com',
						siteId: 123,
						from: 'https://site-to-be-migrated.com',
					},
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.SITE_MIGRATION_ASSISTED_MIGRATION,
					query: {
						siteSlug: 'example.wordpress.com',
						siteId: 123,
						from: 'https://site-to-be-migrated.com',
					},
				} );
			} );

			it( 'redirects to site-migration-assisted-migration step skipping ticket creation', () => {
				const destination = runNavigation( {
					from: STEPS.SITE_MIGRATION_CREDENTIALS,
					dependencies: {
						action: 'continue',
					},
					query: {
						siteSlug: 'example.wordpress.com',
						siteId: 123,
						from: 'https://site-to-be-migrated.com',
					},
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.SITE_MIGRATION_ASSISTED_MIGRATION,
					query: {
						siteSlug: 'example.wordpress.com',
						siteId: 123,
						from: 'https://site-to-be-migrated.com',
						preventTicketCreation: 'true',
					},
				} );
			} );

			it( 'redirects to site-migration-already-wpcom step when the user is already on WPCOM', () => {
				const destination = runNavigation( {
					from: STEPS.SITE_MIGRATION_CREDENTIALS,
					dependencies: {
						action: 'already-wpcom',
					},
					query: {
						siteSlug: 'example.wordpress.com',
						siteId: 123,
						from: 'https://site-to-be-migrated.com',
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

			it( 'redirects to site-migration-other-platform-detected-import step when the site platform is not wordpress', () => {
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

			it( 'redirects to SITE_MIGRATION_APPLICATION_PASSWORD_AUTHORIZATION when the user uses the application passwords', () => {
				const destination = runNavigation( {
					from: STEPS.SITE_MIGRATION_CREDENTIALS,
					dependencies: {
						action: 'application-passwords-approval',
					},
					query: {
						siteSlug: 'example.wordpress.com',
						siteId: 123,
						from: 'https://site-to-be-migrated.com',
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

			it( 'redirects to FALLBACK_CREDENTIALS when credentials are required', () => {
				const destination = runNavigation( {
					from: STEPS.SITE_MIGRATION_CREDENTIALS,
					dependencies: {
						action: 'credentials-required',
					},
					query: {
						siteSlug: 'example.wordpress.com',
						siteId: 123,
						from: 'https://site-to-be-migrated.com',
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
				it( 'redirects back to the SITE_MIGRATION_CREDENTIALS', () => {
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
			} );
		} );

		describe( 'SITE_MIGRATION_FALLBACK_CREDENTIALS', () => {
			it( 'redirects to SITE_MIGRATION_ASSISTED_MIGRATION when the user skips the form enabling the ticket creation', () => {
				const destination = runNavigation( {
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

				expect( destination ).toMatchDestination( {
					step: STEPS.SITE_MIGRATION_ASSISTED_MIGRATION,
					query: {
						siteSlug: 'example.wordpress.com',
						siteId: 123,
						from: 'https://site-to-be-migrated.com',
						preventTicketCreation: 'true',
					},
				} );
			} );

			it( 'redirects to SITE_MIGRATION_ASSISTED_MIGRATION disabling the ticket creation', () => {
				const destination = runNavigation( {
					from: STEPS.SITE_MIGRATION_FALLBACK_CREDENTIALS,
					query: {
						siteSlug: 'example.wordpress.com',
						siteId: 123,
						from: 'https://site-to-be-migrated.com',
					},
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.SITE_MIGRATION_ASSISTED_MIGRATION,
					query: {
						siteSlug: 'example.wordpress.com',
						siteId: 123,
						from: 'https://site-to-be-migrated.com',
						preventTicketCreation: 'true',
					},
				} );
			} );

			describe( 'back', () => {
				it( 'redirects back to the SITE_MIGRATION_CREDENTIALS', () => {
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

				it( 'redirects back to SITE_MIGRATION_APPLICATION_PASSWORD_AUTHORIZATION is query backTo is set to this steps', () => {
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

		describe( 'SITE_MIGRATION_ASSIGN_TRIAL_PLAN', () => {
			//TODO: Verify why there is two error cases pointing to the same error step
			it( 'redirects to error there is any error', () => {
				const destination = runNavigation( {
					from: STEPS.SITE_MIGRATION_ASSIGN_TRIAL_PLAN,
					query: {
						siteSlug: 'example.wordpress.com',
						siteId: 123,
					},
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.ERROR,
					query: null,
				} );
			} );
			it( 'redirects to error state when there is some error', () => {
				const destination = runNavigation( {
					from: STEPS.SITE_MIGRATION_ASSIGN_TRIAL_PLAN,
					dependencies: {
						error: 'ticket-creation',
					},
					query: {
						siteSlug: 'example.wordpress.com',
						siteId: 123,
					},
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.ERROR,
					query: null,
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

			it( 'redirects to the assisted migration step when the user skips the import', () => {
				const destination = runNavigation( {
					from: STEPS.SITE_MIGRATION_OTHER_PLATFORM_DETECTED_IMPORT,
					query: {
						siteSlug: 'example.wordpress.com',
						siteId: 123,
						from: 'oldsite.com',
					},
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.SITE_MIGRATION_ASSISTED_MIGRATION,
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
			it( 'redirects to the site authorization url when the user authorizes the application password', () => {
				const currentURL = `https://calypso/setup/${ STEPS.SITE_MIGRATION_APPLICATION_PASSWORD_AUTHORIZATION.slug }`;
				window.location.href = currentURL;

				runNavigation( {
					from: STEPS.SITE_MIGRATION_APPLICATION_PASSWORD_AUTHORIZATION,
					query: {
						siteSlug: 'example.wordpress.com',
						siteId: 123,
						from: 'http://oldsite.com',
					},
					dependencies: {
						action: 'authorization',
						authorizationUrl:
							'https://oldsite.com/wp-admin/authorize-application.php?app_name=Migrate+to+WordPress.com&app_id=c95b5f6a-b93f-4ece-96c2-a6660bfcb6d2',
					},
				} );

				expect( window.location.assign ).toMatchURL( {
					path: `https://oldsite.com/wp-admin/authorize-application.php`,
					query: {
						app_id: 'c95b5f6a-b93f-4ece-96c2-a6660bfcb6d2',
						app_name: 'Migrate to WordPress.com',
						success_url: currentURL,
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

			it( 'redirects to SITE_MIGRATION_ASSISTED_MIGRATION when the user ask for help', () => {
				const destination = runNavigation( {
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

				expect( destination ).toMatchDestination( {
					step: STEPS.SITE_MIGRATION_ASSISTED_MIGRATION,
					query: {
						siteSlug: 'example.wordpress.com',
						siteId: 123,
						from: 'http://oldsite.com',
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

	describe( 'goBack', () => {
		it( 'redirect the user back to the identify step from how to migrate', async () => {
			const { runUseStepNavigationGoBack } = renderFlow( siteMigrationFlow );

			runUseStepNavigationGoBack( {
				currentStep: STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug,
			} );

			expect( getFlowLocation() ).toEqual( {
				path: `/${ STEPS.SITE_MIGRATION_HOW_TO_MIGRATE.slug }?siteSlug=example.wordpress.com`,
				state: null,
			} );
		} );

		it( 'redirects the user back the calypso import page when they come from there', async () => {
			const { runUseStepNavigationGoBack } = renderFlow( siteMigrationFlow );

			runUseStepNavigationGoBack( {
				currentStep: STEPS.SITE_MIGRATION_IMPORT_OR_MIGRATE.slug,
				currentURL: `/setup/site-migration/${ STEPS.SITE_MIGRATION_IMPORT_OR_MIGRATE.slug }?ref=calypso-importer&siteSlug=site-to-be-migrated.com`,
			} );

			expect( window.location.assign ).toHaveBeenCalledWith(
				`/import/site-to-be-migrated.com?ref=site-migration`
			);
		} );

		it( 'redirects the user back to the internal import list selection from migrate or import screen when they come from', async () => {
			const { runUseStepNavigationGoBack } = renderFlow( siteMigrationFlow );

			runUseStepNavigationGoBack( {
				currentStep: STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug,
			} );

			expect( getFlowLocation() ).toEqual( {
				path: `/${ STEPS.SITE_MIGRATION_HOW_TO_MIGRATE.slug }?siteSlug=example.wordpress.com`,
				state: null,
			} );
		} );

		it( 'redirects the user to the goal step when going back from the identify step', async () => {
			const { runUseStepNavigationGoBack } = renderFlow( siteMigrationFlow );

			runUseStepNavigationGoBack( {
				currentStep: STEPS.SITE_MIGRATION_IDENTIFY.slug,
			} );

			expect( window.location.assign ).toHaveBeenCalledWith(
				'/setup/site-setup/goals?siteSlug=example.wordpress.com'
			);
		} );

		it( 'redirects the user to the how-to-migrate step when going back from the credentials step', async () => {
			const { runUseStepNavigationGoBack } = renderFlow( siteMigrationFlow );

			runUseStepNavigationGoBack( {
				currentStep: STEPS.SITE_MIGRATION_CREDENTIALS.slug,
			} );

			expect( getFlowLocation() ).toEqual( {
				path: `/${ STEPS.SITE_MIGRATION_HOW_TO_MIGRATE.slug }?siteSlug=example.wordpress.com`,
				state: null,
			} );
		} );

		it( 'redirects the user to the credentials step when going back from the application password authorization step', async () => {
			const { runUseStepNavigationGoBack } = renderFlow( siteMigrationFlow );

			runUseStepNavigationGoBack( {
				currentStep: STEPS.SITE_MIGRATION_APPLICATION_PASSWORD_AUTHORIZATION.slug,
			} );

			expect( getFlowLocation() ).toEqual( {
				path: `/${ STEPS.SITE_MIGRATION_CREDENTIALS.slug }?siteSlug=example.wordpress.com`,
				state: null,
			} );
		} );

		it( 'redirects the user to the credentials step when going back from the fallback step', async () => {
			const { runUseStepNavigationGoBack } = renderFlow( siteMigrationFlow );

			runUseStepNavigationGoBack( {
				currentStep: STEPS.SITE_MIGRATION_FALLBACK_CREDENTIALS.slug,
			} );

			expect( getFlowLocation() ).toEqual( {
				path: `/${ STEPS.SITE_MIGRATION_CREDENTIALS.slug }?siteSlug=example.wordpress.com`,
				state: null,
			} );
		} );

		it( 'redirects the user to the application password authorization step when going back from the fallback step with the backTo query param', async () => {
			const { runUseStepNavigationGoBack } = renderFlow( siteMigrationFlow );

			runUseStepNavigationGoBack( {
				currentStep: STEPS.SITE_MIGRATION_FALLBACK_CREDENTIALS.slug,
				currentURL: `/setup/${ STEPS.SITE_MIGRATION_FALLBACK_CREDENTIALS.slug }?siteSlug=example.wordpress.com&backTo=${ STEPS.SITE_MIGRATION_APPLICATION_PASSWORD_AUTHORIZATION.slug }`,
			} );

			//TODO: Check if really make sense to have this backTo url here
			expect( getFlowLocation() ).toEqual( {
				path: `/${ STEPS.SITE_MIGRATION_APPLICATION_PASSWORD_AUTHORIZATION.slug }?siteSlug=example.wordpress.com&backTo=${ STEPS.SITE_MIGRATION_APPLICATION_PASSWORD_AUTHORIZATION.slug }`,
				state: null,
			} );
		} );

		it( 'redirects the user to the other platform detected import step when going back from the credentials step', async () => {
			const { runUseStepNavigationGoBack } = renderFlow( siteMigrationFlow );

			runUseStepNavigationGoBack( {
				currentStep: STEPS.SITE_MIGRATION_OTHER_PLATFORM_DETECTED_IMPORT.slug,
			} );

			expect( getFlowLocation() ).toEqual( {
				path: `/${ STEPS.SITE_MIGRATION_CREDENTIALS.slug }?siteSlug=example.wordpress.com`,
				state: null,
			} );
		} );
	} );
} );
