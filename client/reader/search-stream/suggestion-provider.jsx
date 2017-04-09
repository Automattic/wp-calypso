/**
 * External Dependencies
 */
import { connect } from 'react-redux';
import React, { Component } from 'react';
import { map, sampleSize } from 'lodash';

/**
 * Internal Dependencies
 */
import i18nUtils from 'lib/i18n-utils';
import { suggestions } from 'reader/search-stream/suggestions';
import { getReaderFollowedTags } from 'state/selectors';

/**
 * Build suggestions from subscribed tags
 * @param  {Number} count The number of suggestions required
 * @param  {Array} tags  An array of subscribed tags
 * @return {Array}       An array of suggestions, or null if no tags where provided
 */
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
		// return null to supperess showing any suggestions until tag subscriptions load
		return null;
	}

	if ( tagSuggestions.length ) {
		return tagSuggestions;
	}

	return suggestionsFromPicks( count );
}

const SuggestionsProvider = ( Element, count = 3 ) => class extends Component {
	// never let the suggestions change once its been set to non-null so that suggestions
	// don't keep getting recalulated every redux-store change
	memoizedSuggestions = null;
	getFirstSuggestions = ( state ) => this.memoizedSuggestions
		? this.memoizedSuggestions
		: this.memoizedSuggestions = getSuggestions( count, getReaderFollowedTags( state ) );

	componentWillUnmount() {
		// when unmounted, let the suggestions refresh
		this.memoizedSuggestions = null;
	}

	EnhancedComponent = connect(
		( state ) => ( {
			suggestions: this.getFirstSuggestions( state ),
		} )
	)( Element );

	render() {
		const EnhancedComponent = this.EnhancedComponent;
		return <EnhancedComponent { ...this.props } />;
	}
};

export default SuggestionsProvider;
