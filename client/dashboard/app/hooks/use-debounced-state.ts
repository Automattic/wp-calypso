import { useDebounce } from '@wordpress/compose';
import { useState, useEffect } from 'react';

const useDebouncedState = < T >(
	defaultValue: T,
	wait: number = 250
): [ T, React.Dispatch< React.SetStateAction< T > >, T ] => {
	const [ state, setState ] = useState( defaultValue );
	const [ debouncedState, setDebouncedState ] = useState( defaultValue );

	const debouncedSetDebouncedState = useDebounce( setDebouncedState, wait );

	useEffect( () => {
		debouncedSetDebouncedState( state );
	}, [ state, debouncedSetDebouncedState ] );

	return [ state, setState, debouncedState ];
};

export default useDebouncedState;
