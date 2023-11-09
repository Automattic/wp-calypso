import { useState } from 'react';
// eslint-disable-next-line no-restricted-imports
import { useInterval } from './use-interal';

type TyperMode = 'TYPING' | 'DELETING';

interface Options {
	/**
	 * The number of characters to type per interval, when even the shortest delay is not enough.
	 * @default 1
	 */
	charactersPerInterval: number;

	/**
	 * The typing delay time in ms between two characters.
	 * @default 120
	 */
	delayBetweenCharacters: number;

	/**
	 * The typing delay in ms between two phrases.
	 * @default 1200
	 */
	delayBetweenPhrases: number;

	/**
	 * Whether the delay between characters should be random.
	 * @default false
	 */
	randomDelayBetweenCharacters?: boolean;
}

const DEFAULT_OPTIONS: Readonly< Options > = {
	charactersPerInterval: 1,
	delayBetweenCharacters: 120,
	delayBetweenPhrases: 1200,
	randomDelayBetweenCharacters: false,
};

/**
 * A React hook that returns typing-machine animated strings
 * @param phrases An array of strings you want to create the typing effect for
 * @param enabled Whether the animation is enabled
 * @param options Animation options
 * @returns truncated strings from `phrases` array.
 * The word get longer at every passing `delayBetweenCharacters` until it's fully spelled,
 * then the next word is spelled out after `delayBetweenPhrases` passes.
 */
export default function useTyper(
	phrases: Array< string > | string,
	enabled = true,
	options?: Partial< Options >
): string {
	const [ charIndex, setCharIndex ] = useState( 0 );
	const [ phraseIndex, setPhraseIndex ] = useState( 0 );
	const [ mode, setMode ] = useState< TyperMode >( 'TYPING' );

	const populatedOptions: Options = { ...DEFAULT_OPTIONS, ...options };
	const delayBetweenCharacters = populatedOptions.randomDelayBetweenCharacters
		? Math.random() * populatedOptions.delayBetweenCharacters
		: populatedOptions.delayBetweenCharacters;

	const delayInCharacters = populatedOptions.randomDelayBetweenCharacters
		? delayBetweenCharacters
		: populatedOptions.delayBetweenPhrases / populatedOptions.delayBetweenCharacters;

	const phrasesArray = Array.isArray( phrases ) ? phrases : [ phrases ];
	const singlePhrase = phrasesArray.length === 1;

	useInterval(
		() => {
			// disable the animation to save render cycles if it's not needed
			if ( enabled && phrasesArray && phrasesArray.length ) {
				// wait extra characters between phrases to emulate a pause between phrases without extra logic
				// `charIndex > word.length` is not a problem for substr :)
				if ( singlePhrase && mode === 'DELETING' ) {
					return;
				}
				if (
					( charIndex - delayInCharacters < phrasesArray[ phraseIndex ].length &&
						mode === 'TYPING' ) ||
					( charIndex >= populatedOptions.charactersPerInterval && mode === 'DELETING' )
				) {
					const increment =
						mode === 'TYPING'
							? populatedOptions.charactersPerInterval
							: -populatedOptions.charactersPerInterval;
					setCharIndex( charIndex + increment );
				} else if ( mode === 'TYPING' ) {
					// start deleting
					setMode( 'DELETING' );
				} else {
					// Pick the next phrase
					setPhraseIndex( ( phraseIndex + 1 ) % phrasesArray.length );
					setMode( 'TYPING' );
				}
			}
		},
		mode === 'TYPING' ? delayBetweenCharacters : populatedOptions.delayBetweenCharacters / 3
	);

	if ( phrasesArray && phrasesArray.length ) {
		return phrasesArray[ phraseIndex ].substr( 0, charIndex );
	}

	return '';
}
