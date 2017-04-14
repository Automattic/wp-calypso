/**
 * External Dependencies
 */
import React, { PropTypes } from 'react';
import { stringify } from 'qs';

/**
 * Internal Dependencies
 */
import { recordTrack } from 'reader/stats';
import analytics from 'lib/analytics';

export function Suggestion( { suggestion, source, sort, railcar } ) {
	const handleSuggestionClick = () => {
		recordTrack( 'calypso_reader_search_suggestion_click', { suggestion, source } );
		analytics.tracks.recordEvent( 'calypso_traintracks_interact', railcar );
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
	suggestion: PropTypes.string.isRequired,
	source: PropTypes.string,
	sort: PropTypes.string,
	railcar: PropTypes.object
};

export default Suggestion;
