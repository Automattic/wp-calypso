export const COMMAND_SEPARATOR = '|~~~|';

export const useCommandFilter = () => {
	const commandFilter = ( value: string, search: string ) => {
		const lowercaseValue = value.toLowerCase();
		const lowercaseSearch = search.toLowerCase();

		const [ beforeSeparator, afterSeparator ] = lowercaseValue.split( COMMAND_SEPARATOR );

		// Check if the search matches the part before the separator
		if ( beforeSeparator.includes( lowercaseSearch ) ) {
			return 1;
		}

		// Check if there is an afterSeparator and the search matches it
		if ( afterSeparator?.includes( lowercaseSearch ) ) {
			return 0.5;
		}

		// No match
		return 0;
	};

	return commandFilter;
};
