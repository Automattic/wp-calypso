import { useState, useEffect } from 'react';

const INTERVAL = 20000;

export function useTermsSuggestions( termSuggestions = [], interval = INTERVAL ) {
	const [ termSuggestion, setTermSuggestion ] = useState( termSuggestions[ 0 ] );
	useEffect( () => {
		const intervalId = setInterval( () => {
			const randomIndex = Math.floor( Math.random() * termSuggestions.length );
			setTermSuggestion( termSuggestions[ randomIndex ] );
		}, interval );
		return () => clearInterval( intervalId );
	}, [ termSuggestions, interval ] );

	return termSuggestion;
}
