/**
 * External dependencies
 */

import React from 'react';
import Gridicon from 'components/gridicon';

/**
 * Internal dependencies
 */
import FormRange from '../';

export default class extends React.PureComponent {
	static displayName = 'Ranges';

	state = {
		rangeValue: 24,
	};

	onChange = ( event ) => {
		this.setState( {
			rangeValue: event.target.value,
		} );
	};

	render() {
		return (
			<FormRange
				minContent={ <Gridicon icon="minus-small" /> }
				maxContent={ <Gridicon icon="plus-small" /> }
				max="100"
				value={ this.state.rangeValue }
				onChange={ this.onChange }
				showValueLabel={ true }
			/>
		);
	}
}
