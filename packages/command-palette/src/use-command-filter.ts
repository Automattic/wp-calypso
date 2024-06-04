export const COMMAND_SEPARATOR = '|~~~|';

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

		// No match
		return 0;
	};

	return commandFilter;
};
