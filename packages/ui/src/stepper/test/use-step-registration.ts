import { renderHook, act } from '@testing-library/react';
import { useStepRegistration } from '../use-step-registration';
import type { StepMeta } from '../types';

describe( 'useStepRegistration duplicate values', () => {
	let warnSpy: jest.SpyInstance;

	beforeEach( () => {
		// Duplicate values are a dev error and emit a one-time console warning;
		// suppress it here so test output stays clean.
		warnSpy = jest.spyOn( console, 'warn' ).mockImplementation( () => {} );
	} );

	afterEach( () => {
		warnSpy.mockRestore();
	} );

	it( 'reflects the surviving instance metadata when a duplicate unmounts', () => {
		const { result } = renderHook( () => useStepRegistration< StepMeta >() );
		let deregisterDuplicate: () => void = () => {};
		act( () => {
			result.current.registerStep( 'a-1', { value: 'a', status: 'completed', disabled: false } );
			deregisterDuplicate = result.current.registerStep( 'a-2', {
				value: 'a',
				status: 'error',
				disabled: true,
			} );
		} );
		// In real usage each Step's effect syncs its own props; the duplicate's
		// sync would overwrite the shared-value entry under value-keyed storage.
		act( () => {
			result.current.updateStep( 'a-2', { value: 'a', status: 'error', disabled: true } );
		} );
		act( () => {
			deregisterDuplicate();
		} );
		// The survivor is instance 'a-1'; its metadata must be reflected, not the
		// unmounted duplicate's stale data.
		expect( result.current.steps ).toEqual( [
			{ value: 'a', status: 'completed', disabled: false },
		] );
	} );

	it( 'keeps the value registered until the last instance unmounts', () => {
		const { result } = renderHook( () => useStepRegistration< StepMeta >() );
		let deregisterFirst: () => void = () => {};
		act( () => {
			deregisterFirst = result.current.registerStep( 'a-1', { value: 'a', disabled: false } );
			result.current.registerStep( 'a-2', { value: 'a', disabled: false } );
		} );
		act( () => {
			deregisterFirst();
		} );
		// One instance remains, so the value stays registered and reflects the
		// surviving instance.
		expect( result.current.steps ).toEqual( [ { value: 'a', disabled: false } ] );
	} );
} );

describe( 'useStepRegistration updateStep', () => {
	function setup() {
		const hook = renderHook( () => useStepRegistration< StepMeta >() );
		act( () => {
			hook.result.current.registerStep( 'a', {
				value: 'a',
				status: 'completed',
				disabled: false,
			} );
			hook.result.current.registerStep( 'b', { value: 'b', disabled: false } );
		} );
		return hook;
	}

	it( 'keeps the same steps array reference when meta has not changed', () => {
		const { result } = setup();
		const before = result.current.steps;
		act( () => {
			result.current.updateStep( 'a', { value: 'a', status: 'completed', disabled: false } );
		} );
		expect( result.current.steps ).toBe( before );
	} );

	it( 'updates the entry when a field value changes', () => {
		const { result } = setup();
		act( () => {
			result.current.updateStep( 'a', { value: 'a', status: 'error', disabled: false } );
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
			result.current.updateStep( 'a', { value: 'a', disabled: false } );
		} );
		expect( result.current.steps[ 0 ] ).toEqual( { value: 'a', disabled: false } );
		expect( result.current.steps[ 0 ] ).not.toHaveProperty( 'status' );
	} );

	it( 'is a no-op for an id that was never registered', () => {
		const { result } = setup();
		const before = result.current.steps;
		act( () => {
			result.current.updateStep( 'missing', { value: 'missing', disabled: false } );
		} );
		expect( result.current.steps ).toBe( before );
	} );

	it( 'preserves registration order when updating a step', () => {
		const { result } = setup();
		act( () => {
			result.current.updateStep( 'a', { value: 'a', status: 'error', disabled: true } );
		} );
		expect( result.current.steps.map( ( s ) => s.value ) ).toEqual( [ 'a', 'b' ] );
	} );
} );
