/**
 * External dependencies
 */
import React, { Component } from 'react';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import SearchCard from 'components/search-card';
import Suggestions from 'components/suggestions';

class SuggestionsExample extends Component {

	static displayName = 'Suggestions';

	static hints = [ "Foo", "Bar", "Baz" ];

	state = {
		query: '',
	}

	hideSuggestions = () => this.setState( { query: '' } );

	handleSearch = query => this.setState( { query: query } );

	handleKeyDown = event => this.refs.suggestions.handleKeyEvent( event );

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
					ref="search"
					onSearch={ this.handleSearch }
					onBlur={ this.hideSuggestions }
					onKeyDown={ this.handleKeyDown }
					placeholder="Type something..." />
				<Suggestions
					ref="suggestions"
					query={ this.state.query }
					suggestions={ this.getSuggestions() }
					suggest={ noop } />
			</div>
		);
	}
}

export default SuggestionsExample;
