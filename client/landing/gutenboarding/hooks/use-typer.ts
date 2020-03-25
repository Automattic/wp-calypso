/**
 * External dependencies
 */
import { useState, useEffect } from 'react';

/**
 * A React hook that returns typing-machine animated strings
 *
 * @param {Array<string>} texts An array of strings you want to create the typing effect for
 * @param {boolean?} enabled Whether the animation is enabled
 * @param {number?} delayBetweenCharacters The typing delay time between two charactors. Default is 75ms
 * @param {number?} delayBetweenWords The typing delay time between two words. Default is 750ms
 */
export default function useTyper(
	texts: Array< string >,
	enabled = true,
	delayBetweenCharacters = 75,
	delayBetweenWords = 750
) {
	const [ indices, setIndices ] = useState( { char: 0, word: 0 } );

	/* measure how many characters' worth of waiting you need to wait between words */
	const delayBetweenWordsMeasuredInCharacters = delayBetweenWords / delayBetweenCharacters;

	useEffect( () => {
		// disable the animation to save render cycles if it's not needed
		if ( enabled ) {
			const timeout = setTimeout( () => {
				// wait extra characters between words to emulate a pause between words without extra logic
				// `indices.char > word.length` length is not a problem for substr :)
				if ( indices.char - delayBetweenWordsMeasuredInCharacters < texts[ indices.word ].length ) {
					setIndices( {
						...indices,
						char: indices.char + 1,
					} );
				} else {
					setIndices( {
						char: 0,
						word: ( indices.word + 1 ) % texts.length,
					} );
				}

				return () => clearTimeout( timeout );
			}, delayBetweenCharacters );
		}
	}, [ enabled, texts, indices, delayBetweenCharacters, delayBetweenWordsMeasuredInCharacters ] );

	return texts[ indices.word ].substr( 0, indices.char );
}
