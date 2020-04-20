/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import CountedTextarea from 'components/forms/counted-textarea';

export default class extends React.PureComponent {
	static displayName = 'CountedTextareas';

	state = {
		value: 'Hello World!',
	};

	onChange = ( event ) => {
		this.setState( {
			value: event.target.value,
		} );
	};

	render() {
		return (
			<CountedTextarea
				value={ this.state.value }
				onChange={ this.onChange }
				acceptableLength={ 20 }
			/>
		);
	}
}
