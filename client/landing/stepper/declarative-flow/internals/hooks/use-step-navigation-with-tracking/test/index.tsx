/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import { renderHook, act } from '@testing-library/react';
import { useSelect } from '@wordpress/data';
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

jest.mock( '@wordpress/data', () => ( {
	useSelect: jest.fn( () => ( {
		intent: '',
		goals: EMPTY_GOALS,
	} ) ),
} ) );
jest.mock( 'calypso/landing/stepper/stores', () => ( {
	ONBOARD_STORE: {},
} ) );
jest.mock( '../../../analytics/record-step-navigation', () => ( {
	recordStepNavigation: jest.fn(),
} ) );

jest.mock( '../can-use-automatic-go-back', () => ( {
	canUseAutomaticGoBack: jest.fn( () => true ),
} ) );

const stepNavControls = {
	submit: jest.fn(),
	exitFlow: jest.fn(),
	goBack: jest.fn(),
	goNext: jest.fn(),
	goToStep: jest.fn(),
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
		jest.clearAllMocks();
		jest.mocked( canUseAutomaticGoBack ).mockReturnValue( true );
		jest.mocked( useSelect ).mockReturnValue( { intent: '', goals: EMPTY_GOALS } );
		window.history.state = null;
		window.history.length = 1;
	} );

	beforeAll( () => {
		Object.defineProperty( window, 'history', {
			value: { back: jest.fn(), state: null, length: 1 },
		} );
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
		( canUseAutomaticGoBack as jest.Mock ).mockReturnValue( false );
		const { result } = renderHook( () => useStepNavigationWithTracking( FlowWithoutGoBack ) );

		expect( result.current.goBack ).toBeUndefined();
	} );

	it( 'calls history.back when goBack is called and canUseAutomaticGoBack is true', () => {
		( canUseAutomaticGoBack as jest.Mock ).mockReturnValue( true );
		const { result } = renderHook( () => useStepNavigationWithTracking( FlowWithoutGoBack ) );
		result.current.goBack?.();

		expect( history.back ).toHaveBeenCalled();
	} );

	it( 'keeps Back available after returning from a later step', () => {
		jest.mocked( canUseAutomaticGoBack ).mockReturnValue( false );
		jest.mocked( useSelect ).mockReturnValue( {
			intent: '',
			goals: EMPTY_GOALS,
			previousStep: 'site-migration-how-to-migrate',
		} );
		window.history.length = 3;
		window.history.state = { idx: 2 };
		const { result, rerender } = renderHook(
			( params ) => useStepNavigationWithTracking( params ),
			{
				initialProps: {
					...FlowWithoutGoBack,
					currentStepRoute: 'site-migration-credentials',
				},
			}
		);

		act( () => result.current.goBack?.() );
		expect( history.back ).toHaveBeenCalledTimes( 1 );

		window.history.state = { idx: 1 };
		rerender( {
			...FlowWithoutGoBack,
			currentStepRoute: 'site-migration-how-to-migrate',
		} );

		expect( result.current.goBack ).toBeDefined();
		act( () => result.current.goBack?.() );
		expect( history.back ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'updates Back availability when the router history index changes', () => {
		jest.mocked( canUseAutomaticGoBack ).mockReturnValue( false );
		window.history.state = { idx: 0 };
		const { result, rerender } = renderHook( () =>
			useStepNavigationWithTracking( FlowWithoutGoBack )
		);

		expect( result.current.goBack ).toBeUndefined();

		window.history.state = { idx: 1 };
		rerender();

		expect( result.current.goBack ).toBeDefined();
	} );

	it( 'does not use forward history to enable Back at the initial route', () => {
		jest.mocked( canUseAutomaticGoBack ).mockReturnValue( false );
		jest.mocked( useSelect ).mockReturnValue( {
			intent: '',
			goals: EMPTY_GOALS,
			previousStep: FlowWithoutGoBack.currentStepRoute,
		} );
		window.history.length = 3;
		window.history.state = { idx: 0 };

		const { result } = renderHook( () => useStepNavigationWithTracking( FlowWithoutGoBack ) );

		expect( result.current.goBack ).toBeUndefined();
	} );

	it( 'uses the previous step when the router history index is unavailable', () => {
		jest.mocked( canUseAutomaticGoBack ).mockReturnValue( false );
		jest.mocked( useSelect ).mockReturnValue( {
			intent: '',
			goals: EMPTY_GOALS,
			previousStep: 'previous-step',
		} );
		window.history.length = 2;

		const { result } = renderHook( () => useStepNavigationWithTracking( FlowWithoutGoBack ) );
		act( () => result.current.goBack?.() );

		expect( history.back ).toHaveBeenCalledTimes( 1 );
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
