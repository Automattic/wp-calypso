/**
 * External dependencies
 */
import React, { useState } from 'react';

/**
 * Internal dependencies
 */
import SuggestionSearch from '../';

const SuggestionSearchExample = () => {
	const [ state, setState ] = useState();

	const sortDisplayResults = ( suggestionsArray, queryString ) =>
		suggestionsArray.sort().map( ( item ) => ( item === queryString ? `→ ${ item }` : item)  );

	return (
		<SuggestionSearch
			id="siteTopic"
			placeholder="Try sushi"
			onChange={ setState }
			sortResults={ sortDisplayResults }
			suggestions={ [
				{ label: 'sushi' },
				{ label: 'onigiri sushi' },
				{ label: 'sea urchin sushi' },
				{ label: 'saury sushi' },
			] }
			value={ state }
		/>
	);
};
SuggestionSearchExample.displayName = 'SuggestionSearchExample';

export default SuggestionSearchExample;
