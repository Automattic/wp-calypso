import type { ThemeFilter } from './types';

export const allowSomeThemeFilters = ( {
	feature,
	subject,
	column,
}: {
	feature?: ThemeFilter;
	subject?: ThemeFilter;
	column?: ThemeFilter;
} ) => ( { feature, subject, column } );

export const findEditedTokenIndex = ( tokens: string[], cursorPosition: number ): number => {
	let tokenEnd = 0;
	for ( let i = 0; i < tokens.length; i++ ) {
		tokenEnd += tokens[ i ].length;

		const cursorIsInsideTheToken = cursorPosition < tokenEnd;
		if ( cursorIsInsideTheToken ) {
			// "" indicates full suggestion request
			return i;
		}

		const cursorAtEndOfTheToken = cursorPosition === tokenEnd;
		if ( cursorAtEndOfTheToken ) {
			// If token is whitespace only and we are at its end
			// maybe we are at the start of next token
			const tokenIsWhiteSpace = tokens[ i ].trim() === '';

			// If this one is white space only next
			// next one must be text
			const moreTokensExist = i < tokens.length - 1;
			if ( tokenIsWhiteSpace && moreTokensExist ) {
				return i + 1;
			}

			// "" indicates full suggestion request
			return i;
		}

		continue; // to the next token
	}

	return cursorPosition;
};

export const computeEditedSearchElement = (
	searchText: string,
	selectionStart: number
): [ string, number ] => {
	const cursorPosition = searchText.slice( 0, selectionStart ).length;
	const tokens = searchText.split( /(\s+)/ );
	let editedSearchElement = '';

	// Get rid of empty match at end
	tokens[ tokens.length - 1 ] === '' && tokens.splice( tokens.length - 1, 1 );
	if ( tokens.length === 0 ) {
		return [ editedSearchElement, cursorPosition ];
	}

	const tokenIndex = findEditedTokenIndex( tokens, cursorPosition );
	if ( tokenIndex < 0 ) {
		return [ editedSearchElement, cursorPosition ];
	}

	editedSearchElement = tokens[ tokenIndex ].trim();
	return [ editedSearchElement, cursorPosition ];
};

export const insertSuggestion = (
	suggestion: string,
	query: string,
	cursorPosition: number
): string => {
	const tokens = query.split( /(\s+)/ );

	// Get rid of empty match at end
	tokens[ tokens.length - 1 ] === '' && tokens.splice( tokens.length - 1, 1 );
	const tokenIndex = findEditedTokenIndex( tokens, cursorPosition );
	if ( tokenIndex < 0 ) {
		return query;
	}

	// Check if we want to add additional space after suggestion so next suggestions card can be opened immediately
	const hasNextTokenFirstSpace = tokens[ tokenIndex + 1 ] && tokens[ tokenIndex + 1 ][ 0 ] === ' ';
	tokens[ tokenIndex ] = hasNextTokenFirstSpace ? suggestion : suggestion + ' ';
	return tokens.join( '' );
};
