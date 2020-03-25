/**
 * External dependencies
 */
import { useState, useEffect, useRef } from 'react';

/**
 * A hook that re-renders after `delay` passes.
 *
 * @param {Function} callback the handler
 * @param {number} delay the interval delay
 */
function useInterval( callback: Function, delay: number ) {
	const savedCallback = useRef( callback );

	// Remember the latest callback.
	useEffect( () => {
		savedCallback.current = callback;
	}, [ callback ] );

	// Set up the interval.
	useEffect( () => {
		function tick() {
			savedCallback.current();
		}
		if ( delay !== null ) {
			const id = setInterval( tick, delay );
			return () => clearInterval( id );
		}
	}, [ delay ] );
}

/**
 * A React hook that returns typing-machine animated strings
 *
 * @param {Array<string>} texts An array of strings you want to create the typing effect for
 * @param {boolean?} enabled Whether the animation is enabled
 * @param {number?} delayBetweenCharacters The typing delay time between two charactors. Default is 120ms
 * @param {number?} delayBetweenWords The typing delay time between two words. Default is 1200ms
 */
export default function useTyper(
	texts: Array< string >,
	enabled = true,
	delayBetweenCharacters = 120,
	delayBetweenWords = 1200
) {
	const [ charIndex, setCharIndex ] = useState( 0 );
	const [ wordIndex, setWordIndex ] = useState( 0 );
	const [ mode, setMode ] = useState( 'TYPING' );

	/* measure how many characters' worth of waiting you need to wait between words */
	const delayInCharacters = delayBetweenWords / delayBetweenCharacters;

	useInterval(
		() => {
			// disable the animation to save render cycles if it's not needed
			if ( enabled ) {
				// wait extra characters between words to emulate a pause between words without extra logic
				// `charIndex > word.length` is not a problem for substr :)
				if (
					( charIndex - delayInCharacters < texts[ wordIndex ].length && mode === 'TYPING' ) ||
					( charIndex > 0 && mode === 'DELETING' )
				) {
					const increment = mode === 'TYPING' ? 1 : -1;
					setCharIndex( charIndex + increment );
				} else if ( mode === 'TYPING' ) {
					// start deleting
					setMode( 'DELETING' );
				} else {
					setWordIndex( ( wordIndex + 1 ) % texts.length );
					setMode( 'TYPING' );
				}
			}
		},
		mode === 'TYPING' ? delayBetweenCharacters : delayBetweenCharacters / 3
	);

	return texts[ wordIndex ].substr( 0, charIndex );
}
