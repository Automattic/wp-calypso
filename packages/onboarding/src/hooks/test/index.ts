import { act, renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { useStepPersistedState } from '../use-persisted-state';

describe( 'useStepPersistedState', () => {
	test( 'Should return default value and update it on request', () => {
		const { result, rerender } = renderHook( () => useStepPersistedState( 'some-random-state' ), {
			wrapper: MemoryRouter,
		} );

		const [ state, setState ] = result.current;

		expect( state ).toEqual( 'some-random-state' );

		act( () => setState( 'new-state' ) );

		rerender();

		expect( result.current[ 0 ] ).toEqual( 'new-state' );
	} );

	test( 'Instances should not collide', () => {
		const { result: resultOne, rerender: rerenderOne } = renderHook(
			() => useStepPersistedState( 'some-random-state' ),
			{
				wrapper: MemoryRouter,
			}
		);
		const { result: resultTwo, rerender: rerenderTwo } = renderHook(
			() => useStepPersistedState( 'some-random-state-2' ),
			{
				wrapper: MemoryRouter,
			}
		);

		const [ state1, setState1 ] = resultOne.current;
		const [ state2, setState2 ] = resultTwo.current;

		expect( state1 ).toEqual( 'some-random-state' );
		expect( state2 ).toEqual( 'some-random-state-2' );

		act( () => setState1( 'new-state-one' ) );
		act( () => setState2( 'new-state-two' ) );

		rerenderOne();
		rerenderTwo();

		expect( resultOne.current[ 0 ] ).toEqual( 'new-state-one' );
		expect( resultTwo.current[ 0 ] ).toEqual( 'new-state-two' );
	} );
} );
