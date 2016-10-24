/**
 * External Dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal Dependencies
 */
import { recordTrack } from 'reader/stats';

export function Suggestion( { suggestion } ) {
	const handleSuggestionClick = () => {
		recordTrack( 'calypso_reader_search_suggestion_click', { suggestion } );
	};

	return (
		<a onClick={ handleSuggestionClick } href={ '/read/search?q=' + encodeURIComponent( suggestion ) } >
			{ suggestion }
		</a>
	);
}

Suggestion.propTypes = {
	suggestion: PropTypes.string.isRequired
};

export default Suggestion;
