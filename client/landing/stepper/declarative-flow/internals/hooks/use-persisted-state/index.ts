import { useCallback, useId, useState } from 'react';
import { useMatch } from 'react-router';

function setStepperState( key: string, state: unknown ) {
	localStorage.setItem( key, JSON.stringify( state ) );
}

function getStepperState( key: string ) {
	const state = localStorage.getItem( key );
	return state ? JSON.parse( state ) : null;
}

/**
 * A hook similar to useState, but persists the state in localStorage. Use `flow`, `step` and `lang`, and the component location in the tree as keys.
 * @param defaultValue the initial value of the state.
 * @returns a tuple with the state and a function to update it.
 */
export function useStepperPersistedState< T >( defaultValue?: T ): [ T, ( newState: T ) => void ] {
	const match = useMatch( '/:flow/:step?/:lang?' );
	const id = useId();
	const { flow = 'flow', step = 'step', lang = 'lang' } = match?.params || {};
	const key = [ 'stepper-state', flow, step, lang, id ].join( '-' );

	const [ state, _setState ] = useState< T >( getStepperState( key ) || defaultValue );

	const setState = useCallback(
		( newState: T ) => {
			_setState( newState );
			setStepperState( key, newState );
		},
		[ _setState, key ]
	);

	return [ state, setState ];
}
