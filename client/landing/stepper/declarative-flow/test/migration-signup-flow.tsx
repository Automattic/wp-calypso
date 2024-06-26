/**
 * @jest-environment jsdom
 */
import { PLAN_MIGRATION_TRIAL_MONTHLY } from '@automattic/calypso-products';
import { isCurrentUserLoggedIn } from '@automattic/data-stores/src/user/selectors';
import { HOSTING_INTENT_MIGRATE } from 'calypso/data/hosting/use-add-hosting-trial-mutation';
import { useFlowLocale } from 'calypso/landing/stepper/hooks/use-flow-locale';
import { useIsSiteOwner } from 'calypso/landing/stepper/hooks/use-is-site-owner';
import { goToCheckout } from '../../utils/checkout';
import { STEPS } from '../internals/steps';
import migrationSignupFlow from '../migration-signup';
import { getFlowLocation, renderFlow } from './helpers';
// we need to save the original object for later to not affect tests from other files
const originalLocation = window.location;

jest.mock( '../../utils/checkout' );
jest.mock( '@automattic/data-stores/src/user/selectors' );
jest.mock( 'calypso/landing/stepper/hooks/use-is-site-owner' );
jest.mock( 'calypso/landing/stepper/hooks/use-flow-locale' );

describe( 'Migration Signup Flow', () => {
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
		window.location.search = '';
		( isCurrentUserLoggedIn as jest.Mock ).mockReturnValue( true );
		( useIsSiteOwner as jest.Mock ).mockReturnValue( {
			isOwner: true,
		} );
	} );

	describe( 'useAssertConditions', () => {
		it( 'redirects the user to the login page when they are not logged in', () => {
			( isCurrentUserLoggedIn as jest.Mock ).mockReturnValue( false );
			const searchValue = '?ref=logged-out-homepage&aff=aff123&vid=vid321';
			window.location.search = searchValue;

			const { runUseAssertionCondition } = renderFlow( migrationSignupFlow );
			runUseAssertionCondition( {
				currentStep: STEPS.SITE_MIGRATION_IDENTIFY.slug,
				currentURL: `/setup/${ STEPS.SITE_MIGRATION_IDENTIFY.slug }${ searchValue }`,
			} );

			expect( window.location.assign ).toHaveBeenCalledWith(
				`/start/account/user-social?variationName=migration-signup&toStepper=true&redirect_to=/setup/migration-signup&vid=vid321&aff=aff123&ref=logged-out-homepage`
			);
		} );

		it( 'redirects the user to the login page with the correct locale when they are not logged in', () => {
			( isCurrentUserLoggedIn as jest.Mock ).mockReturnValue( false );
			( useFlowLocale as jest.Mock ).mockReturnValue( 'fr' );
			const searchValue = '?ref=logged-out-homepage&aff=aff123&vid=vid321&locale=fr';
			window.location.search = searchValue;

			const { runUseAssertionCondition } = renderFlow( migrationSignupFlow );
			runUseAssertionCondition( {
				currentStep: STEPS.SITE_MIGRATION_IDENTIFY.slug,
				currentURL: `/setup/${ STEPS.SITE_MIGRATION_IDENTIFY.slug }${ searchValue }`,
			} );

			expect( window.location.assign ).toHaveBeenCalledWith(
				`/start/account/user-social/fr?variationName=migration-signup&toStepper=true&redirect_to=/setup/migration-signup%3Flocale%3Dfr&vid=vid321&aff=aff123&ref=logged-out-homepage`
			);
		} );
	} );

	describe( 'useStepNavigation', () => {
		it( 'redirects the user to the processing step from the create-site step', () => {
			const { runUseStepNavigationSubmit } = renderFlow( migrationSignupFlow );

			runUseStepNavigationSubmit( {
				currentStep: STEPS.SITE_CREATION_STEP.slug,
				currentURL: `/setup/create-site`,
			} );

			expect( getFlowLocation() ).toEqual( {
				path: `/${ STEPS.PROCESSING.slug }?siteSlug=`,
				state: null,
			} );
		} );

		it( 'redirects the user to the site-migration-identify step from the processing step', () => {
			const { runUseStepNavigationSubmit } = renderFlow( migrationSignupFlow );

			runUseStepNavigationSubmit( {
				currentStep: STEPS.PROCESSING.slug,
				currentURL: `/setup/${ STEPS.PROCESSING.slug }?siteSlug=`,
				dependencies: {
					siteSlug: 'example.wordpress.com',
					siteId: 123,
				},
			} );

			expect( getFlowLocation() ).toEqual( {
				path: `/${ STEPS.SITE_MIGRATION_IDENTIFY.slug }?siteSlug=example.wordpress.com`,
				state: null,
			} );
		} );

		it( 'redirects the user to the site-migration-upgrade-plan step from the processing step when we have a from', () => {
			const { runUseStepNavigationSubmit } = renderFlow( migrationSignupFlow );

			runUseStepNavigationSubmit( {
				currentStep: STEPS.PROCESSING.slug,
				currentURL: `/setup/${ STEPS.PROCESSING.slug }?siteSlug=&from=https%3A%2F%2Fexample.com%2F`,
				dependencies: {
					siteSlug: 'example.wordpress.com',
					siteId: 123,
				},
			} );

			expect( getFlowLocation() ).toEqual( {
				path: `/${ STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug }?siteSlug=example.wordpress.com&from=https%3A%2F%2Fexample.com%2F`,
				state: {
					hideFreeMigrationTrialForNonVerifiedEmail: true,
				},
			} );
		} );

		it( 'redirects the user to the checkout page with the correct destination params', () => {
			const { runUseStepNavigationSubmit } = renderFlow( migrationSignupFlow );

			runUseStepNavigationSubmit( {
				currentURL: `/setup/${ STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug }?siteSlug=example.wordpress.com`,
				currentStep: STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug,
				dependencies: {
					goToCheckout: true,
					plan: PLAN_MIGRATION_TRIAL_MONTHLY,
					sendIntentWhenCreatingTrial: true,
				},
			} );

			expect( goToCheckout ).toHaveBeenCalledWith( {
				destination: `/setup/migration-signup/${ STEPS.SITE_MIGRATION_INSTRUCTIONS_I2.slug }?siteSlug=example.wordpress.com`,
				extraQueryParams: { hosting_intent: HOSTING_INTENT_MIGRATE },
				flowName: 'migration-signup',
				siteSlug: 'example.wordpress.com',
				stepName: STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug,
				plan: PLAN_MIGRATION_TRIAL_MONTHLY,
			} );
		} );

		it( 'redirects the user to the processing step from the site creation step', () => {
			const { runUseStepNavigationSubmit } = renderFlow( migrationSignupFlow );

			runUseStepNavigationSubmit( {
				currentStep: STEPS.SITE_CREATION_STEP.slug,
				currentURL: `/setup/${ STEPS.SITE_CREATION_STEP.slug }?siteSlug=example.wordpress.com`,
			} );

			expect( getFlowLocation() ).toEqual( {
				path: `/${ STEPS.PROCESSING.slug }?siteSlug=example.wordpress.com`,
				state: null,
			} );
		} );

		it( 'redirects the user to error step if there was an error during the process', () => {
			const { runUseStepNavigationSubmit } = renderFlow( migrationSignupFlow );

			runUseStepNavigationSubmit( {
				currentStep: STEPS.PROCESSING.slug,
				dependencies: {
					error: true,
				},
			} );

			expect( getFlowLocation() ).toEqual( {
				path: `/${ STEPS.ERROR.slug }`,
				state: null,
			} );
		} );
	} );
} );
