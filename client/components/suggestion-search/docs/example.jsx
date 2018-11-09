/** @format */

/**
 * External dependencies
 */
import React, { PureComponent } from 'react';

/**
 * Internal dependencies
 */
import SuggestionSearch from '../';

class SuggestionSearchExample extends PureComponent {
	render() {
		return (
			<SuggestionSearch
				id="siteTopic"
				placeholder={ 'Try sushi' }
				onChange={ this.onSiteTopicChange }
				suggestions={ [ 'sushi', 'onigiri sushi', 'sea urchin sushi', 'saury sushi' ] }
			/>
		);
	}
}

export default SuggestionSearchExample;
