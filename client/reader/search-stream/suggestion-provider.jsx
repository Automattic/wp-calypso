/**
 * External Dependencies
 */
import { connect } from 'react-redux';
import React, { Component } from 'react';
import { map, sampleSize } from 'lodash';

/**
 * Internal Dependencies
 */
import { getLocaleSlug } from 'lib/i18n-utils';
import { suggestions } from 'reader/search-stream/suggestions';
import getReaderFollowedTags from 'state/selectors/get-reader-followed-tags';
import createRandomId from '@automattic/calypso-analytics';

/**
 * Build suggestions from subscribed tags
 *
 * @param  {number} count The number of suggestions required
 * @param  {Array} tags  An array of subscribed tags
 * @returns {Array}       An array of suggestions, or null if no tags where provided
 */
function suggestionsFromTags( count, tags ) {
	if ( tags ) {
		if ( tags.length <= count ) {
			return [];
		}
		return map( sampleSize( tags, count ), ( tag, i ) => {
			const text = ( tag.displayName || tag.slug ).replace( /-/g, ' ' );
			const ui_algo = 'read:search-suggestions:tags/1';
			return suggestionWithRailcar( text, ui_algo, i );
		} );
	}
	return null;
}

function suggestionsFromPicks( count ) {
	const lang = getLocaleSlug().split( '-' )[ 0 ];
	if ( suggestions[ lang ] ) {
		return map( sampleSize( suggestions[ lang ], count ), ( tag, i ) => {
			const ui_algo = 'read:search-suggestions:picks/1';
			return suggestionWithRailcar( tag, ui_algo, i );
		} );
	}
	return null;
}

function suggestionWithRailcar( text, ui_algo, position ) {
	return {
		text: text,
		railcar: {
			railcar: createRandomId() + '-' + position,
			ui_algo: ui_algo,
			ui_position: position,
			rec_result: text,
		},
	};
}

function getSuggestions( count, tags ) {
	const tagSuggestions = suggestionsFromTags( count, tags );

	// return null to suppress showing any suggestions until tag subscriptions load.
	if ( tagSuggestions === null ) {
		return null;
	}

	const newSuggestions = tagSuggestions.length ? tagSuggestions : suggestionsFromPicks( count );

	return newSuggestions;
}

const SuggestionsProvider = ( Element, count = 3 ) =>
	class extends Component {
		// never let the suggestions change once its been set to non-null so that suggestions
		// don't keep getting recalulated every redux-store change
		memoizedSuggestions = null;
		getFirstSuggestions = state =>
			this.memoizedSuggestions
				? this.memoizedSuggestions
				: ( this.memoizedSuggestions = getSuggestions( count, getReaderFollowedTags( state ) ) );

		componentWillUnmount() {
			// when unmounted, let the suggestions refresh
			this.memoizedSuggestions = null;
		}

		EnhancedComponent = connect( state => ( {
			suggestions: this.getFirstSuggestions( state ),
		} ) )( Element );

		render() {
			const EnhancedComponent = this.EnhancedComponent;
			return <EnhancedComponent { ...this.props } />;
		}
	};

export default SuggestionsProvider;
