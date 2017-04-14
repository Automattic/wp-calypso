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
import analytics from 'lib/analytics';

/**
 * Build suggestions from subscribed tags
 * @param  {Number} count The number of suggestions required
 * @param  {Array} tags  An array of subscribed tags
 * @return {Array}       An array of suggestions, or null if no tags where provided
 */
function suggestionsFromTags( count, tags ) {
	const tagSuggestions = [];
	let sampleSuggestions = {};
	if ( tags ) {
		if ( tags.length <= count ) {
			return [];
		}
		sampleSuggestions = map( sampleSize( tags, count ), tag => ( tag.displayName || tag.slug ).replace( /-/g, ' ' ) );

		for ( let i = 0; i < sampleSuggestions.length; i++ ) {
			tagSuggestions.push( {
				text: sampleSuggestions[ i ],
				railcar: {
					railcar: analytics.tracks.createRandomId() + '-' + i,
					ui_algo: 'read:search-suggestions:tags/1',
					ui_position: i,
					rec_result: sampleSuggestions[ i ],
				}
			} );
		}

		return tagSuggestions;
	}
	return null;
}

function suggestionsFromPicks( count ) {
	const lang = i18nUtils.getLocaleSlug().split( '-' )[ 0 ];
	const pickSuggestions = [];
	let sampleSuggestions = {};

	if ( suggestions[ lang ] ) {
		sampleSuggestions = sampleSize( suggestions[ lang ], count );

		for ( let i = 0; i < sampleSuggestions.length; i++ ) {
			pickSuggestions.push( {
				text: sampleSuggestions[ i ],
				railcar: {
					railcar: analytics.tracks.createRandomId() + '-' + i,
					ui_algo: 'read:search-suggestions:picks/1',
					ui_position: i,
					rec_result: sampleSuggestions[ i ],
				}
			} );
		}

		return pickSuggestions;
	}
	return null;
}

function getSuggestions( count, tags ) {
	let currentSuggestions = suggestionsFromTags( count, tags );
	if ( currentSuggestions === null ) {
		// return null to supperess showing any suggestions until tag subscriptions load
		return null;
	}

	if ( ! currentSuggestions.length ) {
		currentSuggestions = suggestionsFromPicks( count );
	}

	trackSuggestionRailcarRender( currentSuggestions );
	return currentSuggestions;
}

function trackSuggestionRailcarRender( suggestionsToTrack ) {
	for ( let i = 0; i < suggestionsToTrack.length; i++ ) {
		analytics.tracks.recordEvent( 'calypso_traintracks_render', suggestionsToTrack[ i ].railcar );
	}
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
