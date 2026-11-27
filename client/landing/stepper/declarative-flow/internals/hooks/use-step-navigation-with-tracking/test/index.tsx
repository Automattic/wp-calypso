/**
 * @vitest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import { renderHook, act } from '@testing-library/react';
import { type Mock, vi } from 'vitest';
import { useStepNavigationWithTracking } from '../';
import {
	STEPPER_TRACKS_EVENT_STEP_NAV_EXIT_FLOW,
	STEPPER_TRACKS_EVENT_STEP_NAV_GO_BACK,
	STEPPER_TRACKS_EVENT_STEP_NAV_GO_NEXT,
	STEPPER_TRACKS_EVENT_STEP_NAV_GO_TO,
	STEPPER_TRACKS_EVENT_STEP_NAV_SUBMIT,
} from '../../../../../constants';
import { recordStepNavigation } from '../../../analytics/record-step-navigation';
import { canUseAutomaticGoBack } from '../can-use-automatic-go-back';

const EMPTY_GOALS = [];

vi.mock( '@wordpress/data', () => ( {
	useSelect: vi.fn( () => ( {
		intent: '',
		goals: EMPTY_GOALS,
	} ) ),
} ) );
vi.mock( 'calypso/landing/stepper/stores', () => ( {
	ONBOARD_STORE: {},
} ) );
vi.mock( '../../../analytics/record-step-navigation', () => ( {
	recordStepNavigation: vi.fn(),
} ) );

vi.mock( '../can-use-automatic-go-back', () => ( {
	canUseAutomaticGoBack: vi.fn( () => true ),
} ) );

const stepNavControls = {
	submit: vi.fn(),
	exitFlow: vi.fn(),
	goBack: vi.fn(),
	goNext: vi.fn(),
	goToStep: vi.fn(),
};

const stepNavControlsWithoutGoBack = {
	...stepNavControls,
	goBack: undefined,
};

const BaseFlow = {
	flow: {
		name: 'mock-flow',
		isSignupFlow: false,
		useSteps: () => [],
		useStepNavigation: () => stepNavControls,
	},
	currentStepRoute: 'mock-step',
	navigate: () => {},
};

const FlowWithoutGoBack = {
	...BaseFlow,
	flow: {
		...BaseFlow.flow,
		useStepNavigation: () => stepNavControlsWithoutGoBack,
	},
};

const getDefaultProps = ( { flow, currentStepRoute } ) => ( {
	intent: '',
	goals: [],
	flow: flow.name,
	step: currentStepRoute,
	variant: undefined,
	providedDependencies: {},
	additionalProps: {},
} );

describe( 'useStepNavigationWithTracking', () => {
	beforeEach( () => {
		vi.clearAllMocks();
	} );

	beforeAll( () => {
		Object.defineProperty( window, 'history', {
			value: { back: vi.fn() },
		} );
	} );

	it( 'forwards submit to the flow without recording it when shouldSkipSubmitTracking is set', () => {
		const { result } = renderHook( () => useStepNavigationWithTracking( BaseFlow ) );
		const providedDependencies = { action: 'update-query', shouldSkipSubmitTracking: true };

		act( () => {
			result.current.submit?.( providedDependencies );
		} );

		expect( stepNavControls.submit ).toHaveBeenCalledWith( providedDependencies );
		expect( recordStepNavigation ).not.toHaveBeenCalled();
	} );

	it( 'returns callbacks for all known navigation controls', () => {
		const { result } = renderHook( () => useStepNavigationWithTracking( BaseFlow ) );

		expect( result.current.submit ).toBeDefined();
		expect( result.current.exitFlow ).toBeDefined();
		expect( result.current.goBack ).toBeDefined();
		expect( result.current.goNext ).toBeDefined();
		expect( result.current.goToStep ).toBeDefined();
	} );

	it( 'doesnt return goBack when the flow does not define a goBack handler and canUseAutomaticGoBack is false', () => {
		( canUseAutomaticGoBack as Mock ).mockReturnValue( false );
		const { result } = renderHook( () => useStepNavigationWithTracking( FlowWithoutGoBack ) );

		expect( result.current.goBack ).toBeUndefined();
	} );

	it( 'calls history.back when goBack is called and canUseAutomaticGoBack is true', () => {
		( canUseAutomaticGoBack as Mock ).mockReturnValue( true );
		const { result } = renderHook( () => useStepNavigationWithTracking( FlowWithoutGoBack ) );
		result.current.goBack?.();

		expect( history.back ).toHaveBeenCalled();
	} );

	it( 'ensures reference equality given same input', () => {
		const { result, rerender } = renderHook(
			( params ) => useStepNavigationWithTracking( params ),
			{
				initialProps: BaseFlow,
			}
		);

		const previous = result.current;

		rerender( BaseFlow );
		expect( result.current ).toBe( previous );
	} );

	it( 'calls the wrapped submit control with correct parameters and records the respective event', () => {
		const { result } = renderHook( () => useStepNavigationWithTracking( BaseFlow ) );
		const providedDependencies = { foo: 'foo' };
		act( () => {
			result.current.submit?.( providedDependencies );
		} );

		expect( stepNavControls.submit ).toHaveBeenCalledWith( providedDependencies );
		expect( recordStepNavigation ).toHaveBeenCalledWith( {
			...getDefaultProps( BaseFlow ),
			event: STEPPER_TRACKS_EVENT_STEP_NAV_SUBMIT,
			providedDependencies,
		} );
	} );

	it( 'calls the wrapped goBack control with correct parameters and records the respective event', () => {
		const { result } = renderHook( () => useStepNavigationWithTracking( BaseFlow ) );

		act( () => {
			result.current.goBack?.();
		} );

		expect( stepNavControls.goBack ).toHaveBeenCalled();
		expect( recordStepNavigation ).toHaveBeenCalledWith( {
			...getDefaultProps( BaseFlow ),
			event: STEPPER_TRACKS_EVENT_STEP_NAV_GO_BACK,
		} );
	} );

	it( 'calls the wrapped goNext control with correct parameters and records the respective event', () => {
		const { result } = renderHook( () => useStepNavigationWithTracking( BaseFlow ) );

		act( () => {
			result.current.goNext?.();
		} );

		expect( stepNavControls.goNext ).toHaveBeenCalled();
		expect( recordStepNavigation ).toHaveBeenCalledWith( {
			...getDefaultProps( BaseFlow ),
			event: STEPPER_TRACKS_EVENT_STEP_NAV_GO_NEXT,
		} );
	} );

	it( 'calls the wrapped exitFlow control with correct parameters and records the respective event', () => {
		const { result } = renderHook( () => useStepNavigationWithTracking( BaseFlow ) );

		act( () => {
			result.current.exitFlow?.( 'to' );
		} );

		expect( stepNavControls.exitFlow ).toHaveBeenCalledWith( 'to' );
		expect( recordStepNavigation ).toHaveBeenCalledWith( {
			...getDefaultProps( BaseFlow ),
			event: STEPPER_TRACKS_EVENT_STEP_NAV_EXIT_FLOW,
			additionalProps: { to: 'to' },
		} );
	} );

	it( 'calls the wrapped goToStep control with correct parameters and records the respective event', () => {
		const { result } = renderHook( () => useStepNavigationWithTracking( BaseFlow ) );

		act( () => {
			result.current.goToStep?.( 'to' );
		} );

		expect( stepNavControls.goToStep ).toHaveBeenCalledWith( 'to' );
		expect( recordStepNavigation ).toHaveBeenCalledWith( {
			...getDefaultProps( BaseFlow ),
			event: STEPPER_TRACKS_EVENT_STEP_NAV_GO_TO,
			additionalProps: { to: 'to' },
		} );
	} );
} );
