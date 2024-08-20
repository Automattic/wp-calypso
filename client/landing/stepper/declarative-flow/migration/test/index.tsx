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
			value: { ...originalLocation, assign: jest.fn(), replace: jest.fn() },
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
			currentURL: addQueryArgs( `/${ flow.name }/${ from.slug }`, query ),
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
			it( 'redirects the user from PLATFORM IDENTIFICATION to CREATE SITE passing the importer url template', () => {
				const destination = runNavigation( {
					from: STEPS.PLATFORM_IDENTIFICATION,
					dependencies: { platform: 'blogger' },
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.SITE_CREATION_STEP,
					query: { platform: 'blogger' },
				} );
			} );

			it( 'redirects the user from PLATFORM IDENTIFICATION to CREATE SITE without passing the importer param when the user select WordPress', () => {
				const destination = runNavigation( {
					from: STEPS.PLATFORM_IDENTIFICATION,
					dependencies: { platform: 'wordpress', url: 'next-url' },
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.SITE_CREATION_STEP,
					query: {},
				} );
			} );

			it( 'redirects the user from PLATFORM IDENTIFICATION to UPGRADE PLAN when the user already have a site and selects WordPress', () => {
				const destination = runNavigation( {
					from: STEPS.PLATFORM_IDENTIFICATION,
					dependencies: { siteId: 123, siteSlug: 'example.wordpress.com', platform: 'wordpress' },
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.MIGRATION_UPGRADE_PLAN,
					query: { siteId: 123, siteSlug: 'example.wordpress.com' },
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
					addQueryArgs( '/setup/site-setup/importerBlogger', {
						siteSlug: 'example.wordpress.com',
						from: '',
						backToFlow: '/migration/platform-identification',
						siteId: 123,
						ref: 'migration',
					} )
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
					addQueryArgs( '/setup/site-setup/importerBlogger', {
						siteSlug: 'example.wordpress.com',
						from: '',
						backToFlow: '/migration/platform-identification',
						siteId: 123,
						ref: 'migration',
					} )
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
					addQueryArgs( '/import/example.wordpress.com', {
						engine: 'substack',
						'from-site': '',
						backToFlow: '/migration/platform-identification',
					} )
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
					},
				} );

				expect( goToCheckout ).toHaveBeenCalledWith( {
					destination: `/setup/migration/migration-how-to-migrate?siteId=123&siteSlug=example.wordpress.com`,
					extraQueryParams: { introductoryOffer: '1' },
					flowName: 'migration',
					siteSlug: 'example.wordpress.com',
					stepName: STEPS.MIGRATION_UPGRADE_PLAN.slug,
					cancelDestination: `/setup/migration/migration-upgrade-plan?plan=business&siteId=123&siteSlug=example.wordpress.com`,
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
					addQueryArgs( '/setup/site-setup/importerWordpress', {
						siteSlug: 'example.wordpress.com',
						from: '',
						option: 'content',
						backToFlow: '/migration/platform-identification',
						siteId: 123,
						ref: 'migration',
						customizedActionFlow: 'migration/migration-upgrade-plan',
						customizedActionLabel: 'I want to migrate my entire site',
					} )
				);
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

			it( 'redirects user from How To Migrate to Capture Source URL when they selects the option "do it for me"', () => {
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

		describe( 'MIGRATION_SOURCE_URL', () => {
			it( 'redirects users from Capture Source URL to Migration assisted', () => {
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

	describe( 'useStepNavigation > goBack', () => {
		it( 'redirect back user from SOURCE URL TO HOW TO MIGRATE', () => {
			const destination = runNavigationBack( {
				from: STEPS.MIGRATION_SOURCE_URL,
				query: { siteId: 123, siteSlug: 'example.wordpress.com' },
			} );

			expect( destination ).toMatchDestination( {
				step: STEPS.MIGRATION_HOW_TO_MIGRATE,
				query: { siteId: 123, siteSlug: 'example.wordpress.com' },
			} );
		} );
	} );

	it( 'redirect back user from MIGRATION_UPGRADE_PLAN > PLATFORM_IDENTIFICATION', () => {
		const destination = runNavigationBack( {
			from: STEPS.MIGRATION_UPGRADE_PLAN,
			query: { siteId: 123, siteSlug: 'example.wordpress.com', plan: 'business' },
		} );

		expect( destination ).toMatchDestination( {
			step: STEPS.PLATFORM_IDENTIFICATION,
			query: { siteId: 123, siteSlug: 'example.wordpress.com', plan: 'business' },
		} );
	} );
} );
