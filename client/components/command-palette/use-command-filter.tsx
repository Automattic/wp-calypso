export const COMMAND_SEPARATOR = '|~~~|';

export const useCommandFilter = () => {
	const commandFilter = ( value: string, search: string ) => {
		const [ beforeSeparator, afterSeparator ] = value.split( COMMAND_SEPARATOR );

		// Check if the search matches the part before the separator
		if ( beforeSeparator.includes( search ) ) {
			return 1;
		}

		// Check if there is an afterSeparator and the search matches it
		if ( afterSeparator && afterSeparator.includes( search ) ) {
			return 0.5;
		}

		// No match
		return 0;
	};

	return commandFilter;
};
