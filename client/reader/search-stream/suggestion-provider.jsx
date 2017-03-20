/**
 * External Dependencies
 */
import { connect } from 'react-redux';
import { map, sampleSize } from 'lodash';

/**
 * Internal Dependencies
 */
import i18nUtils from 'lib/i18n-utils';
import { suggestions } from 'reader/search-stream/suggestions';
import { getReaderFollowedTags } from 'state/selectors';

function suggestionsFromTags( count, tags ) {
	if ( tags ) {
		if ( tags.length <= count ) {
			return [];
		}
		return map( sampleSize( tags, count ), tag => ( tag.displayName || tag.slug ).replace( /-/g, ' ' ) );
	}
	return null;
}

function suggestionsFromPicks( count ) {
	const lang = i18nUtils.getLocaleSlug().split( '-' )[ 0 ];

	if ( suggestions[ lang ] ) {
		return sampleSize( suggestions[ lang ], count );
	}
	return null;
}

function getSuggestions( count, tags ) {
	const tagSuggestions = suggestionsFromTags( count, tags );
	if ( tagSuggestions === null ) {
		return null;
	}

	if ( tagSuggestions.length ) {
		return tagSuggestions;
	}

	return suggestionsFromPicks( count );
}

const SuggestionsProvider = ( Element, count = 3 ) => connect(
	( state ) => ( {
		suggestions: getSuggestions( count, getReaderFollowedTags( state ) )
	} )
)( Element );

export default SuggestionsProvider;
