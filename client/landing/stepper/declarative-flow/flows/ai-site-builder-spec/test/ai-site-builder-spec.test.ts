/**
 * @jest-environment jsdom
 */
import { STEPS } from '../../../internals/steps';
import { ProcessingResult } from '../../../internals/steps-repository/processing-step/constants';
import aiSiteBuilderSpec from '../ai-site-builder-spec';

jest.mock( '@automattic/calypso-config', () => ( {
	__esModule: true,
	default: { isEnabled: jest.fn( () => true ) },
} ) );

jest.mock( '@automattic/onboarding', () => ( {
	AI_SITE_BUILDER_SPEC_FLOW: 'ai-site-builder-spec',
	ONBOARDING_FLOW: 'onboarding',
} ) );

jest.mock( '@automattic/posthog', () => ( { init: jest.fn() } ) );
jest.mock( 'calypso/landing/stepper/hooks/use-query', () => ( {
	useQuery: jest.fn(),
} ) );
jest.mock( 'calypso/state', () => ( { useSelector: jest.fn() } ) );
jest.mock( 'calypso/state/current-user/selectors', () => ( {
	getCurrentUser: jest.fn(),
} ) );

describe( 'ai-site-builder-spec flow', () => {
	it( 'keeps the production Site Spec flow unchanged without build_wow', () => {
		window.history.replaceState( {}, '', '/setup/ai-site-builder-spec/site-spec' );

		expect( aiSiteBuilderSpec.initialize() ).toEqual( [ STEPS.SITE_SPEC ] );
	} );

	it( 'adds site generation only for the explicit build_wow flow', () => {
		window.history.replaceState( {}, '', '/setup/ai-site-builder-spec/site-spec?build_wow=1' );

		expect( aiSiteBuilderSpec.initialize() ).toEqual( [ STEPS.SITE_SPEC, STEPS.SITE_GENERATION ] );
	} );

	it( 'gives a blueprint-archive run somewhere to wait', () => {
		window.history.replaceState(
			{},
			'',
			'/setup/ai-site-builder-spec/site-spec?blueprint_archive_import=1&blueprint_slug=961&wow_funnel=blueprint'
		);

		expect( aiSiteBuilderSpec.initialize() ).toEqual( [
			STEPS.SITE_SPEC,
			STEPS.PROCESSING,
			STEPS.ERROR,
		] );
	} );

	describe( 'navigation', () => {
		const originalLocation = window.location;
		const navigate = jest.fn();
		const submitFrom = ( slug: string, providedDependencies: Record< string, unknown > = {} ) =>
			aiSiteBuilderSpec
				.useStepNavigation( slug as never, navigate )
				.submit( { slug, providedDependencies } as never );

		beforeEach( () => {
			jest.clearAllMocks();
		} );

		afterEach( () => {
			Object.defineProperty( window, 'location', {
				value: originalLocation,
				writable: true,
				configurable: true,
			} );
		} );

		it( 'sends a confirmed spec straight to the waiting screen', () => {
			submitFrom( 'site-spec' );

			// Replacing rather than pushing keeps Back off the spec the customer just confirmed.
			expect( navigate ).toHaveBeenCalledWith( 'processing', undefined, true );
		} );

		it( 'hands off to the built site once the wait resolves', () => {
			const assign = jest.fn();
			Object.defineProperty( window, 'location', {
				value: { assign },
				writable: true,
				configurable: true,
			} );

			submitFrom( 'processing', {
				processingResult: ProcessingResult.SUCCESS,
				redirectTo: 'https://example.wordpress.com/wp-admin/site-editor.php',
			} );

			expect( assign ).toHaveBeenCalledWith(
				'https://example.wordpress.com/wp-admin/site-editor.php'
			);
			expect( navigate ).not.toHaveBeenCalled();
		} );

		it( 'shows the error step when the wait fails', () => {
			submitFrom( 'processing', { processingResult: ProcessingResult.FAILURE } );

			expect( navigate ).toHaveBeenCalledWith( 'error', undefined, true );
		} );
	} );
} );
