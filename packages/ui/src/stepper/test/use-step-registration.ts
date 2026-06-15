import { renderHook, act } from '@testing-library/react';
import { useStepRegistration } from '../use-step-registration';
import type { StepMeta } from '../types';

describe( 'useStepRegistration updateStep', () => {
	function setup() {
		const hook = renderHook( () => useStepRegistration< StepMeta >() );
		act( () => {
			hook.result.current.registerStep( { value: 'a', status: 'completed', disabled: false } );
			hook.result.current.registerStep( { value: 'b', disabled: false } );
		} );
		return hook;
	}

	it( 'keeps the same steps array reference when meta has not changed', () => {
		const { result } = setup();
		const before = result.current.steps;
		act( () => {
			result.current.updateStep( { value: 'a', status: 'completed', disabled: false } );
		} );
		expect( result.current.steps ).toBe( before );
	} );

	it( 'updates the entry when a field value changes', () => {
		const { result } = setup();
		act( () => {
			result.current.updateStep( { value: 'a', status: 'error', disabled: false } );
		} );
		expect( result.current.steps[ 0 ] ).toEqual( {
			value: 'a',
			status: 'error',
			disabled: false,
		} );
	} );

	it( 'updates the entry when a field present in the existing meta is absent from the new meta', () => {
		const { result } = setup();
		// `status` key intentionally omitted — the compare must not treat a
		// removed field as "no change".
		act( () => {
			result.current.updateStep( { value: 'a', disabled: false } );
		} );
		expect( result.current.steps[ 0 ] ).toEqual( { value: 'a', disabled: false } );
		expect( result.current.steps[ 0 ] ).not.toHaveProperty( 'status' );
	} );

	it( 'is a no-op for a value that was never registered', () => {
		const { result } = setup();
		const before = result.current.steps;
		act( () => {
			result.current.updateStep( { value: 'missing', disabled: false } );
		} );
		expect( result.current.steps ).toBe( before );
	} );

	it( 'preserves registration order when updating a step', () => {
		const { result } = setup();
		act( () => {
			result.current.updateStep( { value: 'a', status: 'error', disabled: true } );
		} );
		expect( result.current.steps.map( ( s ) => s.value ) ).toEqual( [ 'a', 'b' ] );
	} );
} );
