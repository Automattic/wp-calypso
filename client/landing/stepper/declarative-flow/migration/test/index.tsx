/**
 * @jest-environment jsdom
 */
import { URLSearchParams } from 'url';
import { isCurrentUserLoggedIn } from '@automattic/data-stores/src/user/selectors';
import { useIsSiteOwner } from 'calypso/landing/stepper/hooks/use-is-site-owner';
import { goToCheckout } from 'calypso/landing/stepper/utils/checkout';
import { addQueryArgs } from 'calypso/lib/url';
import flow from '../';
import { HOW_TO_MIGRATE_OPTIONS } from '../../../constants';
import { STEPS } from '../../internals/steps';
import { MigrationUpgradePlanActions } from '../../internals/steps-repository/migration-upgrade-plan/actions';
import { getFlowLocation, renderFlow } from '../../test/helpers';

// we need to save the original object for later to not affect tests from other files
const originalLocation = window.location;

jest.mock( '@automattic/data-stores/src/user/selectors' );
jest.mock( 'calypso/landing/stepper/hooks/use-is-site-owner' );
jest.mock( 'calypso/landing/stepper/utils/checkout' );

describe( `${ flow.name }`, () => {
	beforeEach( () => {
		Object.defineProperty( window, 'location', {
			value: { ...originalLocation, assign: jest.fn(), replace: jest.fn() },
		} );
		jest.clearAllMocks();
	} );

	afterAll( () => {
		Object.defineProperty( window, 'location', originalLocation );
	} );

	beforeEach( () => {
		( window.location.assign as jest.Mock ).mockClear();
		( isCurrentUserLoggedIn as jest.Mock ).mockReturnValue( true );
		( useIsSiteOwner as jest.Mock ).mockReturnValue( {
			isOwner: true,
		} );

		window.location.search = '';
	} );

	const runNavigation = ( { from, dependencies = {}, query = {} } ) => {
		const { runUseStepNavigationSubmit } = renderFlow( flow );

		runUseStepNavigationSubmit( {
			currentStep: from.slug,
			dependencies: dependencies,
			currentURL: addQueryArgs( query, `/${ flow.name }/${ from.slug }` ),
		} );

		const destination = getFlowLocation();
		const [ pathname, searchParams ] = destination?.path?.split( '?' ) ?? [ '', '' ];

		return {
			step: pathname.replace( /^\/+/, '' ),
			query: new URLSearchParams( searchParams ),
		};
	};

	const runNavigationBack = ( { from, dependencies = {}, query = {} } ) => {
		const { runUseStepNavigationGoBack } = renderFlow( flow );

		runUseStepNavigationGoBack( {
			currentStep: from.slug,
			dependencies: dependencies,
			currentURL: addQueryArgs( query, `/${ flow.name }/${ from.slug }` ),
		} );

		const destination = getFlowLocation();
		const [ pathname, searchParams ] = destination?.path?.split( '?' ) ?? [ '', '' ];

		return {
			step: pathname.replace( /^\/+/, '' ),
			query: new URLSearchParams( searchParams ),
		};
	};

	describe( 'useStepNavigation', () => {
		describe( 'PLATFORM IDENTIFICATION STEP', () => {
			it( 'redirects the user from PLATFORM IDENTIFICATION to CREATE SITE passing the importer url template', () => {
				const destination = runNavigation( {
					from: STEPS.PLATFORM_IDENTIFICATION,
					dependencies: { platform: 'blogger' },
					query: { from: 'optional' },
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.SITE_CREATION_STEP,
					query: { from: 'optional', platform: 'blogger' },
				} );
			} );

			it( 'redirects the user from PLATFORM IDENTIFICATION to CREATE SITE without passing the importer param when the user select WordPress', () => {
				const destination = runNavigation( {
					from: STEPS.PLATFORM_IDENTIFICATION,
					dependencies: { platform: 'wordpress', url: 'next-url' },
					query: { from: 'optional' },
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.SITE_CREATION_STEP,
					query: { from: 'optional' },
				} );
			} );

			it( 'redirects the user from PLATFORM IDENTIFICATION to UPGRADE PLAN when the user already have a site and selects WordPress', () => {
				const destination = runNavigation( {
					from: STEPS.PLATFORM_IDENTIFICATION,
					dependencies: { siteId: 123, siteSlug: 'example.wordpress.com', platform: 'wordpress' },
					query: { from: 'optional' },
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.MIGRATION_UPGRADE_PLAN,
					query: { siteId: 123, siteSlug: 'example.wordpress.com', from: 'optional' },
				} );
			} );

			it( 'redirects the user from PLATFORM IDENTIFICATION to IMPORT when siteSlug/siteId it is available', async () => {
				runNavigation( {
					from: STEPS.PLATFORM_IDENTIFICATION,
					dependencies: {
						platform: 'blogger',
					},
					query: {
						siteId: 123,
						siteSlug: 'example.wordpress.com',
					},
				} );

				expect( window.location.assign ).toHaveBeenCalledWith(
					addQueryArgs(
						{
							siteSlug: 'example.wordpress.com',
							from: '',
							backToFlow: '/migration/platform-identification',
							siteId: 123,
							ref: 'migration',
						},
						'/setup/site-setup/importerBlogger'
					)
				);
			} );
		} );

		describe( 'SITE_CREATION STEP', () => {
			beforeEach( () => {
				jest.clearAllMocks();
			} );

			it( 'redirects user from SITE_CREATION to PROCESSING', () => {
				const destination = runNavigation( {
					from: STEPS.SITE_CREATION_STEP,
					query: { from: 'optional' },
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.PROCESSING,
					query: { from: 'optional' },
				} );
			} );

			it( 'redirects user from SITE_CREATION to PROCESSING passing the importer param', () => {
				const destination = runNavigation( {
					from: STEPS.SITE_CREATION_STEP,
					query: { platform: 'any-platform' },
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.PROCESSING,
					query: { platform: 'any-platform' },
				} );
			} );
		} );

		describe( 'PROCESSING STEP', () => {
			it( 'redirect user from PROCESSING to WPCOM IMPORTER when a wpcom importer is selected', () => {
				runNavigation( {
					from: STEPS.PROCESSING,
					query: {
						platform: 'blogger',
						siteSlug: 'example.wordpress.com',
						siteId: 123,
					},
				} );

				expect( window.location.replace ).toHaveBeenCalledWith(
					addQueryArgs(
						{
							siteSlug: 'example.wordpress.com',
							from: '',
							backToFlow: '/migration/platform-identification',
							siteId: 123,
							ref: 'migration',
						},
						'/setup/site-setup/importerBlogger'
					)
				);
			} );

			it( 'redirect user from PROCESSING to WPORG IMPORTER when a wporg importer is selected', () => {
				runNavigation( {
					from: STEPS.PROCESSING,
					query: {
						platform: 'substack',
						siteId: 123,
						siteSlug: 'example.wordpress.com',
					},
				} );

				expect( window.location.replace ).toHaveBeenCalledWith(
					addQueryArgs(
						{
							engine: 'substack',
							'from-site': '',
							backToFlow: '/migration/platform-identification',
						},
						'/import/example.wordpress.com'
					)
				);
			} );

			it( 'redirect user from PROCESSING to UPGRADE PLAN when no importer is available', () => {
				const destination = runNavigation( {
					from: STEPS.PROCESSING,
					query: {},
					dependencies: { siteSlug: 'example.wordpress.com', siteId: 123 },
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.MIGRATION_UPGRADE_PLAN,
					query: { siteId: 123, siteSlug: 'example.wordpress.com' },
				} );
			} );

			it( 'redirects user from PROCESSING > Checkout page when plan is already selected', () => {
				runNavigation( {
					from: STEPS.PROCESSING,
					query: {
						plan: 'business',
						siteId: 123,
						siteSlug: 'example.wordpress.com',
						from: 'https://example.com',
					},
				} );

				expect( goToCheckout ).toHaveBeenCalledWith( {
					destination: `/setup/migration/migration-how-to-migrate?siteId=123&siteSlug=example.wordpress.com&from=https%3A%2F%2Fexample.com`,
					extraQueryParams: { introductoryOffer: '1' },
					flowName: 'migration',
					siteSlug: 'example.wordpress.com',
					stepName: STEPS.MIGRATION_UPGRADE_PLAN.slug,
					cancelDestination: `/setup/migration/migration-upgrade-plan?plan=business&siteId=123&siteSlug=example.wordpress.com&from=https%3A%2F%2Fexample.com`,
					plan: 'business-bundle',
					forceRedirection: true,
				} );
			} );

			it( 'redirects user from PROCESSING to UPGRADE PLAN when the plan is selected but unknown', () => {
				const destination = runNavigation( {
					from: STEPS.PROCESSING,
					query: {
						plan: 'unknown',
						siteId: 123,
						siteSlug: 'example.wordpress.com',
					},
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.MIGRATION_UPGRADE_PLAN,
					query: { siteId: 123, siteSlug: 'example.wordpress.com' },
				} );
			} );
		} );

		describe( 'MIGRATION_UPGRADE_PLAN STEP', () => {
			it( 'redirects user from MIGRATION_UPGRADE_PLAN to Checkout page', () => {
				runNavigation( {
					from: STEPS.MIGRATION_UPGRADE_PLAN,
					query: { siteId: 123, siteSlug: 'example.wordpress.com' },
					dependencies: { goToCheckout: true, plan: 'business', userAcceptedDeal: false },
				} );

				expect( goToCheckout ).toHaveBeenCalledWith( {
					destination: `/setup/migration/migration-how-to-migrate?siteId=123&siteSlug=example.wordpress.com`,
					extraQueryParams: undefined,
					flowName: 'migration',
					siteSlug: 'example.wordpress.com',
					stepName: STEPS.MIGRATION_UPGRADE_PLAN.slug,
					cancelDestination: `/setup/migration/migration-upgrade-plan?siteId=123&siteSlug=example.wordpress.com`,
					plan: 'business',
				} );
			} );

			it( 'redirects user from MIGRATION_UPGRADE_PLAN to Import when user they decide do it', () => {
				runNavigation( {
					from: STEPS.MIGRATION_UPGRADE_PLAN,
					query: { siteId: 123, siteSlug: 'example.wordpress.com' },
					dependencies: {
						goToCheckout: false,
						action: MigrationUpgradePlanActions.IMPORT_CONTENT_ONLY,
					},
				} );

				expect( window.location.replace ).toHaveBeenCalledWith(
					addQueryArgs(
						{
							siteSlug: 'example.wordpress.com',
							from: '',
							option: 'content',
							backToFlow: '/migration/platform-identification',
							customizedActionGoToFlow: '/migration/migration-upgrade-plan',
							siteId: 123,
							ref: 'migration',
						},
						'/setup/site-setup/importerWordpress'
					)
				);
			} );

			it( 'redirects user from MIGRATION_UPGRADE_PLAN using SITE_MIGRATION_CREDENTIALS as destination when they accept the offer', () => {
				runNavigation( {
					from: STEPS.MIGRATION_UPGRADE_PLAN,
					query: { siteId: 123, siteSlug: 'example.wordpress.com' },
					dependencies: { goToCheckout: true, plan: 'business', userAcceptedDeal: true },
				} );

				expect( goToCheckout ).toHaveBeenCalledWith( {
					destination: `/setup/migration/site-migration-credentials?siteId=123&siteSlug=example.wordpress.com`,
					extraQueryParams: undefined,
					flowName: 'migration',
					siteSlug: 'example.wordpress.com',
					stepName: STEPS.MIGRATION_UPGRADE_PLAN.slug,
					cancelDestination: `/setup/migration/migration-upgrade-plan?siteId=123&siteSlug=example.wordpress.com`,
					plan: 'business',
				} );
			} );
		} );

		describe( 'MIGRATION_HOW_TO_MIGRATE STEP', () => {
			it( 'redirects user from How To Migrate to Site Instructions when they select the option "do it myself"', () => {
				const destination = runNavigation( {
					from: STEPS.MIGRATION_HOW_TO_MIGRATE,
					query: { siteId: 123, siteSlug: 'example.wordpress.com' },
					dependencies: { how: HOW_TO_MIGRATE_OPTIONS.DO_IT_MYSELF },
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.SITE_MIGRATION_INSTRUCTIONS,
					query: { siteId: 123, siteSlug: 'example.wordpress.com' },
				} );
			} );

			it( 'redirects user from How To Migrate > SITE_MIGRATION_CREDENTIALS when they selects the option "do it for me"', () => {
				const destination = runNavigation( {
					from: STEPS.MIGRATION_HOW_TO_MIGRATE,
					query: { siteId: 123, siteSlug: 'example.wordpress.com' },
					dependencies: { how: HOW_TO_MIGRATE_OPTIONS.DO_IT_FOR_ME },
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.SITE_MIGRATION_CREDENTIALS,
					query: { siteId: 123, siteSlug: 'example.wordpress.com' },
				} );
			} );
		} );

		describe( 'SITE_MIGRATION_CREDENTIALS STEP', () => {
			it( 'redirects users from SITE_MIGRATION_CREDENTIALS > SITE_MIGRATION_ASSISTED_MIGRATION', () => {
				const destination = runNavigation( {
					from: STEPS.SITE_MIGRATION_CREDENTIALS,
					query: {
						siteId: 123,
						siteSlug: 'example.wordpress.com',
						from: 'http://oldsite.example.com',
					},
					dependencies: { action: 'submit' },
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.SITE_MIGRATION_ASSISTED_MIGRATION,
					query: {
						siteId: 123,
						siteSlug: 'example.wordpress.com',
						from: 'http://oldsite.example.com',
						preventTicketCreation: 'true',
					},
				} );
			} );

			it( 'redirects users from SITE_MIGRATION_CREDENTIALS > SITE_MIGRATION_ASSISTED_MIGRATION passing the skipped query param', () => {
				const destination = runNavigation( {
					from: STEPS.SITE_MIGRATION_CREDENTIALS,
					query: { siteId: 123, siteSlug: 'example.wordpress.com' },
					dependencies: { action: 'skip' },
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.SITE_MIGRATION_ASSISTED_MIGRATION,
					query: { siteId: 123, siteSlug: 'example.wordpress.com' },
				} );
			} );

			it( 'redirects users from SITE_MIGRATION_CREDENTIALS > SITE_MIGRATION_ALREADY_WPCOM when the site is already on WPCOM', () => {
				const destination = runNavigation( {
					from: STEPS.SITE_MIGRATION_CREDENTIALS,
					query: {
						siteId: 123,
						siteSlug: 'example.wordpress.com',
						from: 'http://oldsite.example.com',
					},
					dependencies: { action: 'already-wpcom' },
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.SITE_MIGRATION_ALREADY_WPCOM,
					query: {
						siteId: 123,
						siteSlug: 'example.wordpress.com',
						from: 'http://oldsite.example.com',
					},
				} );
			} );

			it( 'redirects users from SITE_MIGRATION_CREDENTIALS > SITE_MIGRATION_APPLICATION_PASSWORD_AUTHORIZATION when the user site supports application passwords', () => {
				const destination = runNavigation( {
					from: STEPS.SITE_MIGRATION_CREDENTIALS,
					query: { siteId: 123, siteSlug: 'example.wordpress.com' },
					dependencies: { action: 'application-passwords-approval' },
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.SITE_MIGRATION_APPLICATION_PASSWORD_AUTHORIZATION,
					query: { siteId: 123, siteSlug: 'example.wordpress.com' },
				} );
			} );

			it( 'redirects users from SITE_MIGRATION_CREDENTIALS > SITE_MIGRATION_FALLBACK_CREDENTIALS when the user site does not support application passwords', () => {
				const destination = runNavigation( {
					from: STEPS.SITE_MIGRATION_CREDENTIALS,
					query: { siteId: 123, siteSlug: 'example.wordpress.com' },
					dependencies: { action: 'credentials-required' },
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.SITE_MIGRATION_FALLBACK_CREDENTIALS,
					query: { siteId: 123, siteSlug: 'example.wordpress.com' },
				} );
			} );
		} );

		describe( 'SITE_MIGRATION_APPLICATION_PASSWORD_AUTHORIZATION STEP', () => {
			it( 'redirects users from SITE_MIGRATION_APPLICATION_PASSWORD_AUTHORIZATION to the application password authorization url', () => {
				runNavigation( {
					from: STEPS.SITE_MIGRATION_APPLICATION_PASSWORD_AUTHORIZATION,
					query: { siteId: 123, siteSlug: 'example.wordpress.com' },
					dependencies: {
						action: 'authorization',
						authorizationUrl: 'https://example.com/application_password_authorization.php',
					},
				} );

				expect( window.location.assign ).toHaveBeenCalledWith(
					'https://example.com/application_password_authorization.php&success_url=https%3A%2F%2Fexample.com%2F'
				);
			} );

			it( 'redirects users from SITE_MIGRATION_APPLICATION_PASSWORD_AUTHORIZATION > SITE_MIGRATION_CREDENTIALS when the user cancels the authorization', () => {
				const destination = runNavigation( {
					from: STEPS.SITE_MIGRATION_APPLICATION_PASSWORD_AUTHORIZATION,
					query: { siteId: 123, siteSlug: 'example.wordpress.com' },
					dependencies: { action: 'fallback-credentials' },
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.SITE_MIGRATION_FALLBACK_CREDENTIALS,
					query: {
						siteId: 123,
						siteSlug: 'example.wordpress.com',
						backTo: STEPS.SITE_MIGRATION_APPLICATION_PASSWORD_AUTHORIZATION.slug,
					},
				} );
			} );
		} );

		describe( 'SITE_MIGRATION_FALLBACK_CREDENTIALS STEP', () => {
			it( 'redirects users from SITE_MIGRATION_FALLBACK_CREDENTIALS to SITE_MIGRATION_ASSISTED_MIGRATION', () => {
				const destination = runNavigation( {
					from: STEPS.SITE_MIGRATION_FALLBACK_CREDENTIALS,
					query: { siteId: 123, siteSlug: 'example.wordpress.com' },
					dependencies: { action: 'submit' },
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.SITE_MIGRATION_ASSISTED_MIGRATION,
					query: {
						siteId: 123,
						siteSlug: 'example.wordpress.com',
						preventTicketCreation: 'true',
					},
				} );
			} );
		} );

		describe( 'SITE_MIGRATION_ALREADY_WPCOM STEP', () => {
			it( 'redirects users from SITE_MIGRATION_ALREADY_WPCOM to SITE_MIGRATION_SUPPORT_INSTRUCTIONS', () => {
				const destination = runNavigation( {
					from: STEPS.SITE_MIGRATION_ALREADY_WPCOM,
					query: { siteId: 123, siteSlug: 'example.wordpress.com' },
					dependencies: { action: 'submit' },
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.SITE_MIGRATION_SUPPORT_INSTRUCTIONS,
					query: { siteId: 123, siteSlug: 'example.wordpress.com', variation: 'goals_shared' },
				} );
			} );
		} );

		describe( 'SITE_MIGRATION_INSTRUCTIONS_STEP', () => {
			it( 'redirects users from SITE_MIGRATION_ASSISTED_MIGRATION to SITE_MIGRATION_CREDENTIALS when hasError is ticket-creation', () => {
				const destination = runNavigation( {
					from: STEPS.SITE_MIGRATION_ASSISTED_MIGRATION,
					query: {
						siteId: 123,
						siteSlug: 'example.wordpress.com',
						from: 'http://oldsite.example.com',
					},
					dependencies: { hasError: 'ticket-creation' },
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.SITE_MIGRATION_CREDENTIALS,
					query: {
						siteId: 123,
						siteSlug: 'example.wordpress.com',
						from: 'http://oldsite.example.com',
						error: 'ticket-creation',
					},
				} );
			} );
		} );

		describe( 'SITE_MIGRATION_INSTRUCTIONS STEP', () => {
			it( 'redirects users from Instructions to Migration started', () => {
				const destination = runNavigation( {
					from: STEPS.SITE_MIGRATION_INSTRUCTIONS,
					query: { siteId: 123, siteSlug: 'example.wordpress.com' },
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.SITE_MIGRATION_STARTED,
					query: { siteId: 123, siteSlug: 'example.wordpress.com' },
				} );
			} );
		} );

		describe( 'SITE_MIGRATION_OTHER_PLATFORM_DETECTED_IMPORT STEP', () => {
			it( 'redirects users from SITE_MIGRATION_OTHER_PLATFORM_DETECTED_IMPORT to SITE_MIGRATION_ASSISTED_MIGRATION', () => {
				runNavigation( {
					from: STEPS.SITE_MIGRATION_OTHER_PLATFORM_DETECTED_IMPORT,
					query: { siteId: 123, siteSlug: 'example.wordpress.com', platform: 'squarespace' },
				} );

				expect( window.location.replace ).toHaveBeenCalledWith(
					'/setup/site-setup/importerSquarespace?siteSlug=example.wordpress.com&from=&backToFlow=%2Fmigration%2Fsite-migration-credentials&siteId=123&ref=migration'
				);
			} );

			it( 'redirects users from SITE_MIGRATION_OTHER_PLATFORM_DETECTED_IMPORT to ASSISTED_MIGRATION when the user skips the import', () => {
				const destination = runNavigation( {
					from: STEPS.SITE_MIGRATION_OTHER_PLATFORM_DETECTED_IMPORT,
					query: { siteId: 123, siteSlug: 'example.wordpress.com', platform: 'squarespace' },
					dependencies: { action: 'skip' },
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.SITE_MIGRATION_SUPPORT_INSTRUCTIONS,
					query: { siteId: 123, siteSlug: 'example.wordpress.com' },
				} );
			} );
		} );
	} );

	describe( 'useStepNavigation > goBack', () => {
		it( 'retain user on the step and set the assisted migration modal query param when the modal query param is not set', () => {
			const destination = runNavigationBack( {
				from: STEPS.MIGRATION_UPGRADE_PLAN,
				query: { siteId: 123, siteSlug: 'example.wordpress.com', plan: 'business' },
			} );

			expect( destination ).toMatchDestination( {
				step: STEPS.MIGRATION_UPGRADE_PLAN,
				query: {
					siteId: 123,
					siteSlug: 'example.wordpress.com',
					plan: 'business',
					showModal: 'true',
				},
			} );
		} );

		it( 'redirects back user from MIGRATION_HOW_TO_MIGRATE URL > PLATFORM_IDENTIFICATION STEP when the assisted modal query param is set', () => {
			const destination = runNavigationBack( {
				from: STEPS.MIGRATION_UPGRADE_PLAN,
				query: {
					siteId: 123,
					siteSlug: 'example.wordpress.com',
					plan: 'business',
					showModal: 'true',
				},
			} );

			expect( destination ).toMatchDestination( {
				step: STEPS.PLATFORM_IDENTIFICATION,
				query: {
					siteId: 123,
					siteSlug: 'example.wordpress.com',
					plan: 'business',
				},
			} );
		} );

		it( 'redirects back user from SITE_MIGRATION_CREDENTIALS  >  MIGRATION_HOW_TO_MIGRATE STEP when the assisted modal query param is set', () => {
			const destination = runNavigationBack( {
				from: STEPS.SITE_MIGRATION_CREDENTIALS,
				query: {
					siteId: 123,
					siteSlug: 'example.wordpress.com',
					from: 'http://oldsite.example.com',
				},
			} );

			expect( destination ).toMatchDestination( {
				step: STEPS.MIGRATION_HOW_TO_MIGRATE,
				query: {
					siteId: 123,
					siteSlug: 'example.wordpress.com',
					from: 'http://oldsite.example.com',
				},
			} );
		} );

		it( 'redirects back user from SITE_MIGRATION_FALLBACK_CREDENTIALS to SITE_MIGRATION_CREDENTIALS', () => {
			const destination = runNavigationBack( {
				from: STEPS.SITE_MIGRATION_FALLBACK_CREDENTIALS,
				query: { siteId: 123, siteSlug: 'example.wordpress.com' },
			} );

			expect( destination ).toMatchDestination( {
				step: STEPS.SITE_MIGRATION_CREDENTIALS,
				query: { siteId: 123, siteSlug: 'example.wordpress.com' },
			} );
		} );

		it( 'redirects back user from SITE_MIGRATION_FALLBACK_CREDENTIALS to SITE_MIGRATION_APPLICATION_PASSWORD_AUTHORIZATION when the backTo query param is set', () => {
			const destination = runNavigationBack( {
				from: STEPS.SITE_MIGRATION_FALLBACK_CREDENTIALS,
				query: {
					siteId: 123,
					siteSlug: 'example.wordpress.com',
					backTo: STEPS.SITE_MIGRATION_APPLICATION_PASSWORD_AUTHORIZATION.slug,
				},
			} );

			expect( destination ).toMatchDestination( {
				step: STEPS.SITE_MIGRATION_APPLICATION_PASSWORD_AUTHORIZATION,
				query: {
					siteId: 123,
					siteSlug: 'example.wordpress.com',
					backTo: STEPS.SITE_MIGRATION_APPLICATION_PASSWORD_AUTHORIZATION.slug,
				},
			} );
		} );
		it( 'redirects back user from SITE_MIGRATION_OTHER_PLATFORM_DETECTED_IMPORT to SITE_MIGRATION_CREDENTIALS', () => {
			const destination = runNavigationBack( {
				from: STEPS.SITE_MIGRATION_OTHER_PLATFORM_DETECTED_IMPORT,
				query: { siteId: 123, siteSlug: 'example.wordpress.com', platform: 'squarespace' },
			} );

			expect( destination ).toMatchDestination( {
				step: STEPS.SITE_MIGRATION_CREDENTIALS,
				query: { siteId: 123, siteSlug: 'example.wordpress.com' },
			} );
		} );
	} );
} );
