/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import { dispatch as wpDispatch, select as wpSelect } from '@wordpress/data';
import React, { useEffect, type FC } from 'react';
import { MemoryRouter, useLocation } from 'react-router';
import { STEPPER_INTERNAL_STORE } from 'calypso/landing/stepper/stores';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { FlowRenderer } from '../';
import { PRIVATE_STEPS } from '../steps';
import type { Flow, StepProps, StepperStep } from '../types';
import type { StepperInternalSelect } from '@automattic/data-stores';

jest.mock( 'calypso/state/current-user/selectors' );
jest.mock( 'calypso/components/data/document-head', () => () => null );
jest.mock( 'calypso/components/loading', () => () => null );
jest.mock( 'calypso/landing/stepper/hooks/use-site-data', () => ( {
	useSiteData: () => ( { site: undefined, siteSlug: '', siteId: 0, siteSlugOrId: '' } ),
} ) );
jest.mock( 'calypso/landing/stepper/hooks/use-save-query-params', () => ( {
	useSaveQueryParams: () => {},
} ) );
jest.mock( 'calypso/landing/stepper/hooks/use-sync-route', () => ( {
	__esModule: true,
	default: () => {},
} ) );
jest.mock( 'calypso/landing/stepper/hooks/use-intent' );
jest.mock( 'calypso/landing/stepper/hooks/use-selected-design' );
jest.mock( 'calypso/landing/stepper/utils/performance-tracking', () => ( {
	useStartStepperPerformanceTracking: () => {},
	StepperPerformanceTrackerStop: () => null,
} ) );
jest.mock( 'calypso/lib/analytics/page-view' );
jest.mock( 'calypso/lib/analytics/tracks' );
jest.mock( '../analytics/record-page-view' );
jest.mock( '../analytics/record-step-start' );
jest.mock( '../analytics/record-step-complete' );
jest.mock( '../hooks/use-flow-analytics', () => ( { useFlowAnalytics: () => {} } ) );
jest.mock( '../hooks/use-sign-up-start-tracking', () => ( { useSignUpStartTracking: () => {} } ) );
jest.mock( '../hooks/use-step-container-v2-logo', () => ( {
	useStepContainerV2Logo: () => null,
} ) );
jest.mock( '../hooks/use-step-navigation-with-tracking', () => ( {
	useStepNavigationWithTracking: () => ( { submit: () => {} } ),
} ) );
jest.mock( '../components/boot', () => ( {
	Boot: ( { children }: { children: React.ReactNode } ) => <>{ children }</>,
} ) );

// The data-stores package types these through its registry wrappers, not the bare wp.data calls.
const stepperInternal = {
	dispatch: () =>
		wpDispatch( STEPPER_INTERNAL_STORE ) as unknown as {
			setStepData: ( data: Record< string, unknown > ) => void;
			clearStepData: () => void;
		},
	select: () => wpSelect( STEPPER_INTERNAL_STORE ) as unknown as StepperInternalSelect,
};

const makeStep = ( slug: string, requiresLoggedInUser = false ): StepperStep => {
	const StepComponent: FC< StepProps > = () => <div>{ `Step: ${ slug }` }</div>;
	return {
		slug,
		requiresLoggedInUser,
		asyncComponent: () => Promise.resolve( { default: StepComponent } ),
	} as StepperStep;
};

// Like the real account step: once logged in it submits from an effect keyed on `navigation`.
const UserStep: FC< StepProps > = ( { navigation } ) => {
	useEffect( () => {
		navigation.submit?.();
	}, [ navigation ] );
	return <div>Step: user</div>;
};

const userStep = {
	...PRIVATE_STEPS.USER,
	asyncComponent: () => Promise.resolve( { default: UserStep } ),
};

const steps = [ makeStep( 'intro' ), makeStep( 'needs-login', true ), userStep ];

const flow: Flow = {
	name: 'some-flow',
	isSignupFlow: true,
	__experimentalUseBuiltinAuth: true,
	useSteps: () => steps,
	useStepNavigation: () => ( { submit: () => {} } ),
};

const render = ( initialEntry: string ) => {
	const visited: string[] = [];
	const LocationProbe = () => {
		const location = useLocation();
		visited.push( location.pathname + location.search );
		return null;
	};

	renderWithProvider(
		<MemoryRouter basename="/setup" initialEntries={ [ initialEntry ] }>
			<LocationProbe />
			<FlowRenderer flow={ flow } steps={ steps } />
		</MemoryRouter>
	);

	return { visited };
};

describe( 'FlowRenderer', () => {
	beforeAll( () => {
		window.scrollTo = jest.fn();
		const appElement = document.createElement( 'div' );
		appElement.id = 'wpcom';
		document.body.appendChild( appElement );
	} );

	beforeEach( () => {
		jest.clearAllMocks();
		( isUserLoggedIn as jest.Mock ).mockReturnValue( true );
		stepperInternal.dispatch().clearStepData();
	} );

	describe( 'the user step hand-off', () => {
		it( 'resumes at the step that required login without passing through the flow root', async () => {
			// What the redirect to the user step leaves behind for a logged-out visitor.
			stepperInternal.dispatch().setStepData( {
				path: 'user',
				intent: '',
				previousStep: 'intro',
				nextStep: 'needs-login',
			} );

			const { visited } = render( '/setup/some-flow/user?blueprint=zoom-test' );

			await waitFor( () => expect( screen.getByText( 'Step: needs-login' ) ).toBeInTheDocument() );

			// The flow root is where flows clear their stores as if the customer had just arrived.
			expect( visited.filter( ( path ) => /^\/some-flow\/?(\?.*)?$/.test( path ) ) ).toEqual( [] );
			// Stepper's navigate reads the query from `window.location`, which the memory router does
			// not drive, so only the path is checked.
			expect( visited.at( -1 ) ).toMatch( /^\/some-flow\/needs-login/ );

			// The target stays in the step data until the next step's own navigation replaces it.
			expect( stepperInternal.select().getStepData() ).toMatchObject( {
				path: 'needs-login',
				nextStep: 'needs-login',
			} );
		} );

		it( 'sends a visitor who lands on the user step directly to the flow root', async () => {
			const { visited } = render( '/setup/some-flow/user?blueprint=zoom-test' );

			await waitFor( () => expect( screen.getByText( 'Step: intro' ) ).toBeInTheDocument() );

			expect( visited ).toContain( '/some-flow' );
		} );
	} );
} );
