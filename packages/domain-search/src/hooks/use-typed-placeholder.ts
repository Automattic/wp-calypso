import { useState, useEffect, useRef } from 'react';

interface AnimationState {
	text: string;
	isAnimating: boolean;
}

export const useTypedPlaceholder = ( phrases: string[], pauseAnimation = false ) => {
	const [ state, setState ] = useState< AnimationState >( {
		text: '',
		isAnimating: true,
	} );

	const charIndexRef = useRef( 0 );
	const phraseIndexRef = useRef( 0 );
	const timeoutIdRef = useRef< ReturnType< typeof setTimeout > >();

	const timeBetweenChars = 60;
	const timeBetweenPhrases = 1500;

	// Control animation state
	useEffect( () => {
		if ( pauseAnimation ) {
			// Stop animation when paused
			setState( { text: '', isAnimating: false } );
		} else {
			// Reset to initial state and restart animation
			setState( { text: '', isAnimating: true } );
			phraseIndexRef.current = 0;
			charIndexRef.current = 0;
		}
	}, [ pauseAnimation ] );

	useEffect( () => {
		if ( ! phrases.length || ! state.isAnimating || pauseAnimation ) {
			return;
		}

		const typeNextChar = () => {
			const currentPhrase = phrases[ phraseIndexRef.current ];

			if ( charIndexRef.current < currentPhrase.length ) {
				// Type next character
				const nextText = currentPhrase.slice( 0, charIndexRef.current + 1 );
				setState( ( prev ) => ( { ...prev, text: nextText } ) );
				charIndexRef.current++;
				timeoutIdRef.current = setTimeout( typeNextChar, timeBetweenChars );
			} else {
				// Finished typing current phrase, wait then move to next
				timeoutIdRef.current = setTimeout( () => {
					setState( ( prev ) => ( { ...prev, text: '' } ) );
					charIndexRef.current = 0;
					phraseIndexRef.current = ( phraseIndexRef.current + 1 ) % phrases.length;

					// After clearing, wait for the full pause before starting next phrase
					timeoutIdRef.current = setTimeout( typeNextChar, timeBetweenPhrases );
				}, timeBetweenPhrases );
			}
		};

		// Start animation
		timeoutIdRef.current = setTimeout( typeNextChar, timeBetweenChars );

		return () => {
			if ( timeoutIdRef.current ) {
				clearTimeout( timeoutIdRef.current );
			}
		};
	}, [ phrases, state.isAnimating, pauseAnimation ] );

	return { placeholder: state.text };
};
