/**
 * External dependencies
 */
import React, { PureComponent } from 'react';

/**
 * Internal dependencies
 */
import SuggestionSearch from '../';

class SuggestionSearchExample extends PureComponent {
	state = { selected: null };

	onSiteTopicChange = value => this.setState( { selected: value } );

	sortDisplayResults = ( suggestionsArray, queryString ) =>
		suggestionsArray.sort().map( item => ( item === queryString ? `→ ${ item }` : item ) );

	render() {
		return (
			<SuggestionSearch
				id="siteTopic"
				placeholder={ 'Try sushi' }
				onChange={ this.onSiteTopicChange }
				sortResults={ this.sortDisplayResults }
				suggestions={ [ 'sushi', 'onigiri sushi', 'sea urchin sushi', 'saury sushi' ] }
			/>
		);
	}
}

export default SuggestionSearchExample;
