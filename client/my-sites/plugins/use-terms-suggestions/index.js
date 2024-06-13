import { useState, useEffect } from 'react';

const INTERVAL_BETWEEN_TERMS = 5000;
const INTERVAL_ANIMATION = 50;

function applyTermAnimation( term, characterIndex, callback ) {
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
export function useTermsSuggestions( termSuggestions = [], interval = INTERVAL_BETWEEN_TERMS ) {
	const [ termSuggestion, setTermSuggestion ] = useState( termSuggestions[ 0 ] );

	useEffect( () => {
		function addInterval() {
			return setInterval( () => {
				const currentIndex = previousIndex % termSuggestions.length;
				previousIndex++;
				applyTermAnimation( termSuggestions[ currentIndex ], 0, setTermSuggestion );
			}, interval );
		}
		let intervalId = addInterval();

		addEventListener( 'scroll', onScroll );
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
		return () => {
			clearInterval( intervalId );
			removeEventListener( 'scroll', onScroll );
		};
	}, [ termSuggestions, interval ] );

	return termSuggestion;
}
