/**
 * @jest-environment jsdom
 */
import { URLSearchParams } from 'url';
import { isCurrentUserLoggedIn } from '@automattic/data-stores/src/user/selectors';
import { addQueryArgs } from '@wordpress/url';
import { useIsSiteOwner } from 'calypso/landing/stepper/hooks/use-is-site-owner';
import { goToCheckout } from 'calypso/landing/stepper/utils/checkout';
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
			value: { ...originalLocation, assign: jest.fn() },
		} );
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
			currentURL: addQueryArgs( `/setup/${ from.slug }`, query ),
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
			it( 'redirects the user from PLATFORM IDENTIFICATION > CREATE SITE', () => {
				const destination = runNavigation( {
					from: STEPS.PLATFORM_IDENTIFICATION,
					dependencies: { platform: 'any-platform', url: 'importerBlogger' },
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.SITE_CREATION_STEP,
					query: { importer: 'importerBlogger' },
				} );
			} );

			it( 'redirects the user from PLATFORM IDENTIFICATION > CREATE SITE without passing the importer param when the user select WordPress', () => {
				const destination = runNavigation( {
					from: STEPS.PLATFORM_IDENTIFICATION,
					dependencies: { platform: 'wordpress', url: 'next-url' },
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.SITE_CREATION_STEP,
					query: {},
				} );
			} );

			it( 'redirects the user from PLATFORM IDENTIFICATION > UPGRADE PLAN when the user already have a site and selects WordPress', () => {
				const destination = runNavigation( {
					from: STEPS.PLATFORM_IDENTIFICATION,
					dependencies: { siteId: 123, siteSlug: 'example.wordpress.com', platform: 'wordpress' },
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.MIGRATION_UPGRADE_PLAN,
					query: { siteId: 123, siteSlug: 'example.wordpress.com' },
				} );
			} );

			it( 'redirects the user from PLATFORM IDENTIFICATION > IMPORT when siteSlug/siteId is available', async () => {
				runNavigation( {
					from: STEPS.PLATFORM_IDENTIFICATION,
					dependencies: {
						siteId: 123,
						siteSlug: 'example.wordpress.com',
						platform: 'blogger',
						url: 'importBlogger',
					},
				} );

				expect( window.location.assign ).toHaveBeenCalled();
			} );
		} );

		describe( 'SITE_CREATION', () => {
			it( 'redirects user from SITE_CREATION to PROCESSING', () => {
				const destination = runNavigation( {
					from: STEPS.SITE_CREATION_STEP,
					query: {},
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.PROCESSING,
					query: {},
				} );
			} );

			it( 'redirects user from SITE_CREATION to PROCESSING passing the importer param', () => {
				const destination = runNavigation( {
					from: STEPS.SITE_CREATION_STEP,
					query: { importer: 'any-importer' },
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.PROCESSING,
					query: { importer: 'any-importer' },
				} );
			} );
		} );

		describe( 'PROCESSING', () => {
			it( 'redirect user from PROCESSING > IMPORTER when an importer is available', () => {
				runNavigation( {
					from: STEPS.PROCESSING,
					query: {
						importer: 'importBlogger',
						siteId: 123,
						siteSlug: 'example.wordpress.com',
					},
				} );

				expect( window.location.assign ).toHaveBeenCalledWith(
					'/setup/site-setup/importBlogger?siteId=123&siteSlug=example.wordpress.com'
				);
			} );

			it( 'redirect user from PROCESSING > UPGRADE PLAN when no importer is available', () => {
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
		} );

		describe( 'MIGRATION_UPGRADE_PLAN', () => {
			it( 'redirects user from MIGRATION_UPGRADE_PLAN > Checkout page', () => {
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

			it( 'redirects user from MIGRATION_UPGRADE_PLAN > Import when user they decide do it', () => {
				runNavigation( {
					from: STEPS.MIGRATION_UPGRADE_PLAN,
					query: { siteId: 123, siteSlug: 'example.wordpress.com' },
					dependencies: {
						goToCheckout: false,
						action: MigrationUpgradePlanActions.IMPORT_CONTENT_ONLY,
					},
				} );

				expect( window.location.assign ).toHaveBeenCalledWith(
					addQueryArgs( '/setup/site-setup/importerWordpress', {
						siteId: 123,
						siteSlug: 'example.wordpress.com',
						backToFlow: 'migration/migration-upgrade-plan',
						option: 'content',
					} )
				);
			} );
		} );

		it( 'redirects user from How To Migrate > Instructions when they select the option "do it myself"', () => {
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

		it( 'redirects user from How To Migrate > Capture Source URL when they selects the option "do it for me"', () => {
			const destination = runNavigation( {
				from: STEPS.MIGRATION_HOW_TO_MIGRATE,
				query: { siteId: 123, siteSlug: 'example.wordpress.com' },
				dependencies: { how: HOW_TO_MIGRATE_OPTIONS.DO_IT_FOR_ME },
			} );

			expect( destination ).toMatchDestination( {
				step: STEPS.MIGRATION_SOURCE_URL,
				query: { siteId: 123, siteSlug: 'example.wordpress.com' },
			} );
		} );

		it( 'redirects users from Instructions > Migration started', () => {
			const destination = runNavigation( {
				from: STEPS.SITE_MIGRATION_INSTRUCTIONS,
				query: { siteId: 123, siteSlug: 'example.wordpress.com' },
			} );

			expect( destination ).toMatchDestination( {
				step: STEPS.SITE_MIGRATION_STARTED,
				query: { siteId: 123, siteSlug: 'example.wordpress.com' },
			} );
		} );

		it( 'redirects users from Capture Source URL > Migration assisted', () => {
			const destination = runNavigation( {
				from: STEPS.MIGRATION_SOURCE_URL,
				query: { siteId: 123, siteSlug: 'example.wordpress.com' },
				dependencies: { from: 'http://oldsite.example.com' },
			} );

			expect( destination ).toMatchDestination( {
				step: STEPS.SITE_MIGRATION_ASSISTED_MIGRATION,
				query: {
					siteId: 123,
					siteSlug: 'example.wordpress.com',
					from: 'http://oldsite.example.com',
				},
			} );
		} );
	} );
} );
