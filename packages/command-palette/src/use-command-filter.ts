export const COMMAND_SEPARATOR = '|~~~|';
export const KEYWORD_SEPARATOR = '|~kw~|';

// Note that until we upgrade to cmdk@1 or above, the scoring system is only used for filtering.
// Scores of zero are ommited from the results and scores above zero are all treated as equal.
// See https://github.com/pacocoursey/cmdk/pull/182

export const useCommandFilter = () => {
	const commandFilter = ( value: string, search: string ) => {
		const lowercaseValue = value.toLowerCase();
		const lowercaseSearch = search.toLowerCase().trim();

		const [ commandLabel, keywords ] = lowercaseValue.split( COMMAND_SEPARATOR );

		// Check if the search matches the part before the separator
		if ( commandLabel.includes( lowercaseSearch ) ) {
			return 1;
		}

		// Check if there is an afterSeparator and the search matches it
		if ( keywords?.includes( lowercaseSearch ) ) {
			return 0.5;
		}

		// Check if any of the keywords allow wildcards, this is indicated by a trailing *
		const wildcardKeywords = ( keywords ?? '' )
			.split( KEYWORD_SEPARATOR )
			.filter( ( keyword ) => keyword.slice( -1 ) === '*' )
			.map( ( keyword ) => keyword.slice( 0, -1 ) );

		if ( wildcardKeywords.some( ( keyword ) => lowercaseSearch.startsWith( keyword ) ) ) {
			return 0.4;
		}

		// No match
		return 0;
	};

	return commandFilter;
};
