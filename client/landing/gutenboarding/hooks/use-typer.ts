/**
 * External dependencies
 */
import { useState } from 'react';

/**
 * Internal dependencies
 */
import { useInterval } from 'calypso/lib/interval/use-interval';

type TyperMode = 'TYPING' | 'DELETING';

interface Options {
	/**
	 * The typing delay time in ms between two characters.
	 *
	 * @default 120
	 */
	delayBetweenCharacters: number;

	/**
	 * The typing delay in ms between two words.
	 *
	 * @default 1200
	 */
	delayBetweenWords: number;
}

const DEFAULT_OPTIONS: Readonly< Options > = {
	delayBetweenCharacters: 120,
	delayBetweenWords: 1200,
};

/**
 * A React hook that returns typing-machine animated strings
 *
 * @param words An array of strings you want to create the typing effect for
 * @param enabled Whether the animation is enabled
 * @param options Animation options
 * @returns truncated strings from `words` array.
 * The word get longer at every passing `delayBetweenCharacters` until it's fully spelled,
 * then the next word is spelled out after `delayBetweenWords` passes.
 */
export default function useTyper(
	words: Array< string >,
	enabled = true,
	options?: Partial< Options >
): string {
	const [ charIndex, setCharIndex ] = useState( 0 );
	const [ wordIndex, setWordIndex ] = useState( 0 );
	const [ mode, setMode ] = useState< TyperMode >( 'TYPING' );

	const populatedOptions: Options = { ...DEFAULT_OPTIONS, ...options };

	// measure how many characters' worth of waiting you need to wait between words
	const delayInCharacters =
		populatedOptions.delayBetweenWords / populatedOptions.delayBetweenCharacters;

	useInterval(
		() => {
			// disable the animation to save render cycles if it's not needed
			if ( enabled && words && words.length ) {
				// wait extra characters between words to emulate a pause between words without extra logic
				// `charIndex > word.length` is not a problem for substr :)
				if (
					( charIndex - delayInCharacters < words[ wordIndex ].length && mode === 'TYPING' ) ||
					( charIndex > 0 && mode === 'DELETING' )
				) {
					const increment = mode === 'TYPING' ? 1 : -1;
					setCharIndex( charIndex + increment );
				} else if ( mode === 'TYPING' ) {
					// start deleting
					setMode( 'DELETING' );
				} else {
					// Pick any word except the current one
					setWordIndex(
						( wordIndex + Math.ceil( Math.random() * ( words.length - 1 ) ) ) % words.length
					);
					setMode( 'TYPING' );
				}
			}
		},
		mode === 'TYPING'
			? populatedOptions.delayBetweenCharacters
			: populatedOptions.delayBetweenCharacters / 3
	);

	if ( words && words.length ) {
		return words[ wordIndex ].substr( 0, charIndex );
	}

	return '';
}
