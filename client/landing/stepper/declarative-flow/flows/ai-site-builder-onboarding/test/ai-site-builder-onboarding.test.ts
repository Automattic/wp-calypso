/**
 * @jest-environment jsdom
 */
import { STEPS } from '../../../internals/steps';
import aiSiteBuilderOnboarding from '../ai-site-builder-onboarding';

jest.mock( '@automattic/onboarding', () => ( {
	AI_SITE_BUILDER_ONBOARDING_FLOW: 'ai-site-builder-onboarding',
	clearStepPersistedState: jest.fn(),
} ) );

jest.mock( '@automattic/data-stores', () => ( {
	Onboard: { SiteIntent: { AIAssembler: 'ai-assembler' } },
} ) );

jest.mock( 'calypso/lib/wp', () => ( {
	req: { post: jest.fn() },
} ) );

jest.mock( '@wordpress/data', () => ( {
	dispatch: () => ( { resetOnboardStore: jest.fn() } ),
	useDispatch: jest.fn(),
	resolveSelect: jest.fn(),
} ) );

jest.mock( 'calypso/landing/stepper/stores', () => ( {
	ONBOARD_STORE: 'ONBOARD_STORE',
	SITE_STORE: 'SITE_STORE',
} ) );

jest.mock( 'calypso/signup/storageUtils', () => ( {
	setSignupCompleteSlug: jest.fn(),
	persistSignupDestination: jest.fn(),
	setSignupCompleteFlowName: jest.fn(),
	setSignupCompleteSiteID: jest.fn(),
	clearSignupDestinationCookie: jest.fn(),
	clearSignupCompleteFlowName: jest.fn(),
	clearSignupCompleteSlug: jest.fn(),
	clearSignupCompleteSiteID: jest.fn(),
} ) );

jest.mock( 'calypso/state/ui/actions', () => ( {
	setSelectedSiteId: jest.fn(),
} ) );

jest.mock( '../../../../utils/steps-with-required-login', () => ( {
	stepsWithRequiredLogin: ( steps: unknown ) => steps,
} ) );

describe( 'ai-site-builder-onboarding flow', () => {
	it( 'initializes domain → plans → create-site → processing → error', async () => {
		const reduxStore = { dispatch: jest.fn(), getState: jest.fn() } as never;
		const steps = await aiSiteBuilderOnboarding.initialize( reduxStore );

		expect( steps.map( ( step ) => step.slug ) ).toEqual( [
			STEPS.DOMAIN_SEARCH.slug,
			STEPS.UNIFIED_PLANS.slug,
			STEPS.SITE_CREATION_STEP.slug,
			STEPS.PROCESSING.slug,
			STEPS.ERROR.slug,
		] );
	} );
} );
