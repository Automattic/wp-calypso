/** @format */

/**
 * External dependencies
 */

import React from 'react';
import GridiconPlusSmall from 'gridicons/dist/plus-small';
import GridiconMinusSmall from 'gridicons/dist/minus-small';

/**
 * Internal dependencies
 */
import FormRange from '../';

export default class extends React.PureComponent {
	static displayName = 'Ranges';

	state = {
		rangeValue: 24,
	};

	onChange = event => {
		this.setState( {
			rangeValue: event.target.value,
		} );
	};

	render() {
		return (
			<FormRange
				minContent={ <GridiconMinusSmall /> }
				maxContent={ <GridiconPlusSmall /> }
				max="100"
				value={ this.state.rangeValue }
				onChange={ this.onChange }
				showValueLabel={ true }
			/>
		);
	}
}
