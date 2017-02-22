/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import page from 'page';
import { initial, flatMap, sampleSize, trim } from 'lodash';

/**
 * Internal dependencies
 */
import Stream from 'reader/stream';
import CompactCard from 'components/card/compact';
import SearchInput from 'components/search';
import { recordTrack } from 'reader/stats';
import { abtest } from 'lib/abtest';
import i18nUtils from 'lib/i18n-utils';
import { suggestions } from 'reader/search-stream/suggestions';
import Suggestion from 'reader/search-stream/suggestion';

function handleSearch( query ) {
	recordTrack( 'calypso_reader_search_from_following', {
		query
	} );

	if ( trim( query ) !== '' ) {
		page( '/read/search?q=' + encodeURIComponent( query ) + '&focus=1' );
	}
}

const shouldShowSearchOnFollowing = abtest( 'readerSearchOnFollowing' ) === 'show';

const FollowingStream = ( props ) => {
	const lang = i18nUtils.getLocaleSlug();

	let suggestionList;
	if ( suggestions[ lang ] ) {
		const pickedSuggestions = sampleSize( suggestions[ lang ], 3 );
		suggestionList = initial( flatMap( pickedSuggestions, query =>
			[ <Suggestion suggestion={ query } source="following" />, ', ' ] ) );
	}
	return (
		<Stream { ...props }>
			{ shouldShowSearchOnFollowing &&
				<CompactCard className="following__search">
					<SearchInput
						onSearch={ handleSearch }
						autoFocus={ false }
						delaySearch={ true }
						delayTimeout={ 500 }
						placeholder={ props.translate( 'Search billions of WordPress.com posts…' ) } />
				</CompactCard>
			}
			{ suggestionList && shouldShowSearchOnFollowing &&
				<p className="search-stream__blank-suggestions">
					{ props.translate( 'Suggestions: {{suggestions /}}.', { components: { suggestions: suggestionList } } ) }
				</p>
			}
			{ shouldShowSearchOnFollowing &&
				<hr className="search-stream__fixed-area-separator" />
			}
		</Stream>
	);
};

export default localize( FollowingStream );
