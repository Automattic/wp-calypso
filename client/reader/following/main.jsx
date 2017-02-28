/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import page from 'page';
import { initial, flatMap, trim } from 'lodash';

/**
 * Internal dependencies
 */
import Stream from 'reader/stream';
import CompactCard from 'components/card/compact';
import SearchInput from 'components/search';
import { recordTrack } from 'reader/stats';
import Suggestion from 'reader/search-stream/suggestion';
import { getSuggestions } from 'reader/search-stream/suggestions';

function handleSearch( query ) {
	recordTrack( 'calypso_reader_search_from_following', {
		query
	} );

	if ( trim( query ) !== '' ) {
		page( '/read/search?q=' + encodeURIComponent( query ) + '&focus=1' );
	}
}

const FollowingStream = ( props ) => {
	const suggestions = getSuggestions();
	const suggestionList = suggestions && initial( flatMap( suggestions, query =>
		[ <Suggestion suggestion={ query } source="following" />, ', ' ] ) );

	return (
		<Stream { ...props }>
			<CompactCard className="following__search">
				<SearchInput
					onSearch={ handleSearch }
					autoFocus={ false }
					delaySearch={ true }
					delayTimeout={ 500 }
					placeholder={ props.translate( 'Search billions of WordPress.com posts…' ) } />
			</CompactCard>
			{ suggestionList &&
				<p className="search-stream__blank-suggestions">
					{ props.translate( 'Suggestions: {{suggestions /}}.', { components: { suggestions: suggestionList } } ) }
				</p>
			}
			<hr className="search-stream__fixed-area-separator" />
		</Stream>
	);
};

export default localize( FollowingStream );
