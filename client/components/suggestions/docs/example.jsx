/**
 * External dependencies
 */
import { noop } from 'lodash';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import SearchCard from 'components/search-card';
import Suggestions from 'components/suggestions';

class SuggestionsExample extends Component {

	static displayName = 'Suggestions';

	static hints = [ 'Foo', 'Bar', 'Baz' ];

	state = {
		query: '',
	}

	setSuggestionsRef = ref => this.suggestionsRef = ref;

	hideSuggestions = () => this.setState( { query: '' } );

	handleSearch = query => this.setState( { query: query } );

	handleKeyDown = event => this.suggestionsRef.handleKeyEvent( event );

	getSuggestions() {
		return SuggestionsExample.hints
			.filter( hint => this.state.query && hint.match( new RegExp( this.state.query, 'i' ) ) )
			.map( hint => ( { label: hint } ) );
	}

	render() {
		return (
			<div className="docs__suggestions-container">
				<SearchCard
					disableAutocorrect
					onSearch={ this.handleSearch }
					onBlur={ this.hideSuggestions }
					onKeyDown={ this.handleKeyDown }
					placeholder="Type something..." />
				<Suggestions
					ref={ this.setSuggestionsRef }
					query={ this.state.query }
					suggestions={ this.getSuggestions() }
					suggest={ noop } />
			</div>
		);
	}
}

export default SuggestionsExample;
