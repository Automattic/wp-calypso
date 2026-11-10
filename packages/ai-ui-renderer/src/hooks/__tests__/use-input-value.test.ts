import { act, renderHook } from '@testing-library/react';
import { useInputValue } from '../use-input-value';
import type { ComponentContext } from '@a2ui/web_core';

function createContext( value: number | { '@path': string } ) {
	const listeners = new Set< () => void >();
	const componentModel = {
		properties: { value },
		onUpdated: {
			subscribe: ( listener: () => void ) => {
				listeners.add( listener );

				return { unsubscribe: () => listeners.delete( listener ) };
			},
		},
	};

	return {
		context: { componentModel } as unknown as ComponentContext,
		update: ( nextValue = componentModel.properties.value ) => {
			componentModel.properties.value = nextValue;
			listeners.forEach( ( listener ) => listener() );
		},
	};
}

it( 'preserves literal numeric edits across unrelated updates and accepts a new server value', () => {
	const { context, update } = createContext( 25 );
	const setValue = jest.fn();
	const { result } = renderHook( () => useInputValue< number >( 25, setValue, context ) );

	act( () => result.current[ 1 ]( 50 ) );

	expect( result.current[ 0 ] ).toBe( 50 );
	expect( setValue ).toHaveBeenCalledWith( 50 );

	act( () => update() );

	expect( result.current[ 0 ] ).toBe( 50 );

	act( () => update( 75 ) );

	expect( result.current[ 0 ] ).toBe( 75 );
} );

it( 'writes bound numbers and reads subsequent data model updates', () => {
	const { context } = createContext( { '@path': '/volume' } );
	const setValue = jest.fn();
	const { result, rerender } = renderHook(
		( { value } ) => useInputValue( value, setValue, context ),
		{ initialProps: { value: 25 } }
	);

	act( () => result.current[ 1 ]( 50 ) );

	expect( setValue ).toHaveBeenCalledWith( 50 );

	rerender( { value: 50 } );

	expect( result.current[ 0 ] ).toBe( 50 );

	rerender( { value: 75 } );

	expect( result.current[ 0 ] ).toBe( 75 );
} );
