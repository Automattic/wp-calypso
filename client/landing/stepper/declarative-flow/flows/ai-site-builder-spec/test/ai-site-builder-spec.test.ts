/**
 * @jest-environment jsdom
 */
import { STEPS } from '../../../internals/steps';
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
} );
