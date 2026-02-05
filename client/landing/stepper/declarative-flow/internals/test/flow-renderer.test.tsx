/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import { FlowRenderer } from '../index';

const mockLoadingSpy = jest.fn( () => null );

jest.mock( '@automattic/components', () => ( {
	WooDashboardLogo: () => <div data-testid="woo-dashboard-logo" />,
} ) );

jest.mock( '@automattic/onboarding', () => ( {
	WOO_HOSTED_PLANS_FLOW: 'woo-hosted-plans',
	Step: {
		Loading: ( props: { hideLogo?: boolean } ) => {
			mockLoadingSpy( props );
			return <div data-testid="loading" />;
		},
		StepContainerV2Provider: ( { children }: { children: React.ReactNode } ) => <>{ children }</>,
	},
} ) );

jest.mock( 'react-router', () => {
	const actual = jest.requireActual( 'react-router' );
	return {
		...actual,
		useParams: () => ( {} ),
	};
} );

jest.mock( '@wordpress/data', () => ( {
	useSelect: jest.fn( () => undefined ),
} ) );

jest.mock( '@wordpress/react-i18n', () => ( {
	useI18n: () => ( { __: ( text: string ) => text } ),
} ) );

jest.mock( 'calypso/components/data/document-head', () => () => null );
jest.mock( 'calypso/components/loading', () => () => <div data-testid="loading-fallback" /> );

jest.mock( 'calypso/landing/stepper/stores', () => ( {
	STEPPER_INTERNAL_STORE: 'STEPPER_INTERNAL_STORE',
} ) );

jest.mock( 'calypso/state', () => ( {
	useSelector: jest.fn( () => false ),
} ) );

jest.mock( 'calypso/state/current-user/selectors', () => ( {
	isUserLoggedIn: () => false,
} ) );

jest.mock( 'calypso/state/sites/selectors', () => ( {
	getSite: jest.fn( () => null ),
} ) );

jest.mock( 'calypso/landing/stepper/hooks/use-first-step', () => ( {
	useFirstStep: () => 'plans',
} ) );

jest.mock( 'calypso/landing/stepper/hooks/use-save-query-params', () => ( {
	useSaveQueryParams: () => {},
} ) );

jest.mock( 'calypso/landing/stepper/hooks/use-site-data', () => ( {
	useSiteData: () => ( { site: undefined, siteSlugOrId: undefined } ),
} ) );

jest.mock( 'calypso/landing/stepper/hooks/use-sync-route', () => ( {
	__esModule: true,
	default: () => {},
} ) );

jest.mock( 'calypso/landing/stepper/utils/performance-tracking', () => ( {
	useStartStepperPerformanceTracking: () => {},
} ) );

jest.mock(
	'calypso/landing/stepper/declarative-flow/helpers/should-use-step-container-v2',
	() => ( {
		shouldUseStepContainerV2: () => true,
	} )
);

jest.mock( 'calypso/landing/stepper/declarative-flow/internals/components/boot', () => ( {
	Boot: ( { fallback }: { fallback: React.ReactNode } ) => <>{ fallback }</>,
} ) );

jest.mock( 'calypso/landing/stepper/declarative-flow/internals/components', () => ( {
	StepRoute: () => null,
} ) );

jest.mock(
	'calypso/landing/stepper/declarative-flow/internals/components/redirect-to-step',
	() => ( {
		RedirectToStep: () => null,
	} )
);

jest.mock( 'calypso/landing/stepper/declarative-flow/internals/hooks/use-flow-analytics', () => ( {
	useFlowAnalytics: () => {},
} ) );

jest.mock( 'calypso/landing/stepper/declarative-flow/internals/hooks/use-flow-navigation', () => ( {
	useFlowNavigation: () => ( {
		navigate: jest.fn(),
		params: {
			flow: 'woo-hosted-plans',
			step: 'plans',
		},
	} ),
} ) );

jest.mock( 'calypso/landing/stepper/declarative-flow/internals/hooks/use-preload-steps', () => ( {
	usePreloadSteps: () => {},
	lazyCache: new Map(),
} ) );

jest.mock(
	'calypso/landing/stepper/declarative-flow/internals/hooks/use-sign-up-start-tracking',
	() => ( {
		useSignUpStartTracking: () => {},
	} )
);

jest.mock(
	'calypso/landing/stepper/declarative-flow/internals/hooks/use-step-navigation-with-tracking',
	() => ( {
		useStepNavigationWithTracking: () => ( {
			goBack: jest.fn(),
			submit: jest.fn(),
		} ),
	} )
);

describe( 'FlowRenderer fallback', () => {
	beforeEach( () => {
		mockLoadingSpy.mockClear();
		window.scrollTo = jest.fn();
		document.body.innerHTML = '<div id="wpcom"></div>';
	} );

	it( 'passes hideLogo for Woo Hosted plans fallback', () => {
		const flow = { name: 'woo-hosted-plans' } as any;
		const steps = [
			{
				slug: 'plans',
				asyncComponent: async () => ( { default: () => null } ),
			},
		] as any;

		render( <FlowRenderer flow={ flow } steps={ steps } /> );

		expect( mockLoadingSpy ).toHaveBeenCalled();
		expect( mockLoadingSpy.mock.calls[ 0 ][ 0 ].hideLogo ).toBe( true );
	} );
} );
