/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import {
	STEPPER_TRACKS_EVENT_STEP_NAV_EXIT_FLOW,
	STEPPER_TRACKS_EVENT_STEP_NAV_GO_BACK,
	STEPPER_TRACKS_EVENT_STEP_NAV_GO_NEXT,
	STEPPER_TRACKS_EVENT_STEP_NAV_GO_TO,
	STEPPER_TRACKS_EVENT_STEP_NAV_SUBMIT,
} from '../../../../../constants';
import { recordStepNavigation } from '../../../analytics/record-step-navigation';
import { useStepNavigationWithTracking } from '../index';

jest.mock( '@wordpress/data', () => ( {
	useSelect: jest.fn(),
} ) );
jest.mock( 'calypso/landing/stepper/stores', () => ( {
	ONBOARD_STORE: {},
} ) );
jest.mock( '../../../analytics/record-step-navigation', () => ( {
	recordStepNavigation: jest.fn(),
} ) );

describe( 'useStepNavigationWithTracking', () => {
	const stepNavControls = {
		submit: jest.fn(),
		exitFlow: jest.fn(),
		goBack: jest.fn(),
		goNext: jest.fn(),
		goToStep: jest.fn(),
	};

	const mockParams = {
		flow: {
			name: 'mock-flow',
			isSignupFlow: false,
			useSteps: () => [],
			useStepNavigation: () => stepNavControls,
		},
		currentStepRoute: 'mock-step',
		navigate: () => {},
		steps: [],
	};

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'returns callbacks for all known navigation controls', () => {
		const { result } = renderHook( () => useStepNavigationWithTracking( mockParams ) );

		expect( result.current ).toHaveProperty( 'submit' );
		expect( result.current ).toHaveProperty( 'exitFlow' );
		expect( result.current ).toHaveProperty( 'goBack' );
		expect( result.current ).toHaveProperty( 'goNext' );
		expect( result.current ).toHaveProperty( 'goToStep' );
	} );

	it( 'calls the wrapped submit control with correct parameters and records the respective event', () => {
		const { result } = renderHook( () => useStepNavigationWithTracking( mockParams ) );
		const providedDependencies = { foo: 'foo' };
		act( () => {
			result.current.submit( { foo: 'foo' }, 'bar', 'baz' );
		} );

		expect( stepNavControls.submit ).toHaveBeenCalledWith( providedDependencies, 'bar', 'baz' );
		expect( recordStepNavigation ).toHaveBeenCalledWith( {
			event: STEPPER_TRACKS_EVENT_STEP_NAV_SUBMIT,
			intent: '',
			flow: 'mock-flow',
			step: 'mock-step',
			variant: undefined,
			providedDependencies,
			additionalProps: undefined,
		} );
	} );

	it( 'calls the wrapped goBack control with correct parameters and records the respective event', () => {
		const { result } = renderHook( () => useStepNavigationWithTracking( mockParams ) );

		act( () => {
			result.current.goBack();
		} );

		expect( stepNavControls.goBack ).toHaveBeenCalled();
		expect( recordStepNavigation ).toHaveBeenCalledWith( {
			event: STEPPER_TRACKS_EVENT_STEP_NAV_GO_BACK,
			intent: '',
			flow: 'mock-flow',
			step: 'mock-step',
			variant: undefined,
			providedDependencies: undefined,
			additionalProps: undefined,
		} );
	} );

	it( 'calls the wrapped goNext control with correct parameters and records the respective event', () => {
		const { result } = renderHook( () => useStepNavigationWithTracking( mockParams ) );

		act( () => {
			result.current.goNext();
		} );

		expect( stepNavControls.goNext ).toHaveBeenCalled();
		expect( recordStepNavigation ).toHaveBeenCalledWith( {
			event: STEPPER_TRACKS_EVENT_STEP_NAV_GO_NEXT,
			intent: '',
			flow: 'mock-flow',
			step: 'mock-step',
			variant: undefined,
			providedDependencies: undefined,
			additionalProps: undefined,
		} );
	} );

	it( 'calls the wrapped exitFlow control with correct parameters and records the respective event', () => {
		const { result } = renderHook( () => useStepNavigationWithTracking( mockParams ) );

		act( () => {
			result.current.exitFlow( 'to' );
		} );

		expect( stepNavControls.exitFlow ).toHaveBeenCalledWith( 'to' );
		expect( recordStepNavigation ).toHaveBeenCalledWith( {
			event: STEPPER_TRACKS_EVENT_STEP_NAV_EXIT_FLOW,
			intent: '',
			flow: 'mock-flow',
			step: 'mock-step',
			variant: undefined,
			providedDependencies: undefined,
			additionalProps: { to: 'to' },
		} );
	} );

	it( 'calls the wrapped goToStep control with correct parameters and records the respective event', () => {
		const { result } = renderHook( () => useStepNavigationWithTracking( mockParams ) );

		act( () => {
			result.current.goToStep( 'to' );
		} );

		expect( stepNavControls.goToStep ).toHaveBeenCalledWith( 'to' );
		expect( recordStepNavigation ).toHaveBeenCalledWith( {
			event: STEPPER_TRACKS_EVENT_STEP_NAV_GO_TO,
			intent: '',
			flow: 'mock-flow',
			step: 'mock-step',
			variant: undefined,
			providedDependencies: undefined,
			additionalProps: { to: 'to' },
		} );
	} );
} );
