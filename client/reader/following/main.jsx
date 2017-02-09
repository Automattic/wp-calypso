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
import SuggestionProvider from 'reader/search-stream/suggestion-provider';
import FollowingIntro from './intro';

function handleSearch( query ) {
	recordTrack( 'calypso_reader_search_from_following', {
		query
	} );

	if ( trim( query ) !== '' ) {
		page( '/read/search?q=' + encodeURIComponent( query ) + '&focus=1' );
	}
}

const FollowingStream = ( props ) => {
	const suggestionList = props.suggestions && initial( flatMap( props.suggestions, query =>
		[ <Suggestion suggestion={ query } source="following" />, ', ' ] ) );

	return (
		<Stream { ...props }>
			<FollowingIntro />
			<CompactCard className="following__search">
				<SearchInput
					onSearch={ handleSearch }
					autoFocus={ false }
					delaySearch={ true }
					delayTimeout={ 500 }
					placeholder={ props.translate( 'Search billions of WordPress.com posts…' ) } />
			</CompactCard>
			<p className="search-stream__blank-suggestions">
				{ suggestionList &&
					props.translate( 'Suggestions: {{suggestions /}}.', {
						components: {
							suggestions: suggestionList
						}
					} )
				}&nbsp;
			</p>
			<hr className="search-stream__fixed-area-separator" />
		</Stream>
	);
};

export default SuggestionProvider( localize( FollowingStream ) );
