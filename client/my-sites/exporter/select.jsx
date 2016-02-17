/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import FormSelect from 'components/forms/form-select';

export default class Select extends Component {
	render() {
		const options = this.props.options.map( ( option ) => {
			return <option key={ option.value } value={ option.value }>{ option.label }</option>
		} );

		return (
			<FormSelect { ...this.props }>
				<option key="default" value="">{ this.props.defaultLabel }</option>
				{ options }
			</FormSelect>
		);
	}
}
