/**
 * External Dependencies
 */
import React, { PropTypes } from 'react';
import { stringify } from 'qs';

/**
 * Internal Dependencies
 */
import { recordTrack } from 'reader/stats';

export function Suggestion( { suggestion, source, sort } ) {
	const handleSuggestionClick = () => {
		recordTrack( 'calypso_reader_search_suggestion_click', { suggestion, source } );
	};

	const args = {
		isSuggestion: 1,
		q: suggestion,
		sort
	};

	const searchUrl = '/read/search?' + stringify( args );

	return (
		<a onClick={ handleSuggestionClick }
			href={ searchUrl } >
			{ suggestion }
		</a>
	);
}

Suggestion.propTypes = {
	suggestion: PropTypes.string.isRequired
};

export default Suggestion;
