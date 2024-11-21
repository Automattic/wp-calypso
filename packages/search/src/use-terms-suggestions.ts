import { useState, useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';

const INTERVAL_BETWEEN_TERMS = 5000;
const INTERVAL_ANIMATION = 50;

function applyTermAnimation(
	term: string,
	characterIndex: number,
	callback: Dispatch< SetStateAction< string > >
) {
	callback( term.substring( 0, characterIndex + 1 ) );
	setTimeout( () => {
		if ( characterIndex < term.length ) {
			applyTermAnimation( term, characterIndex + 1, callback );
		}
	}, INTERVAL_ANIMATION );
}

// This function adds an interval which will run every 'interval' seconds
// It will then loop through the terms from the 'termSuggestions' array and apply the animation
// The interval will be cleared when the user scrolls down the page, and then re-added when
// the user scrolls back up
let previousIndex = 0;
export function useTermsSuggestions(
	termSuggestions: string[],
	interval = INTERVAL_BETWEEN_TERMS
): string {
	if ( ! termSuggestions?.length ) {
		throw new Error( 'termSuggestions must be a non-empty array of strings' );
	}

	const [ termSuggestion, setTermSuggestion ] = useState< string >( termSuggestions[ 0 ] );

	useEffect( () => {
		function addInterval() {
			return setInterval( () => {
				previousIndex++;
				const currentIndex = previousIndex % termSuggestions.length;
				applyTermAnimation( termSuggestions[ currentIndex ], 0, setTermSuggestion );
			}, interval );
		}

		let intervalId = addInterval();
		let intervalActive = true;

		function onScroll() {
			if ( intervalActive ) {
				clearInterval( intervalId );
				intervalActive = false;
			}

			if ( window.scrollY < 100 ) {
				intervalId = addInterval();
				intervalActive = true;
			}
		}

		window.addEventListener( 'scroll', onScroll );

		return () => {
			clearInterval( intervalId );
			window.removeEventListener( 'scroll', onScroll );
		};
	}, [ termSuggestions, interval ] );

	return termSuggestion;
}
