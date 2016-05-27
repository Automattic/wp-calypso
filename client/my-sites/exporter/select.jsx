/**
 * External dependencies
 */
import React, { Component } from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import FormSelect from 'components/forms/form-select';

export default class Select extends Component {
	render() {
		const options = this.props.options.map( ( option, i ) => {
			return <option key={ i } value={ option.value }>{ option.label }</option>;
		} );

		return (
			<FormSelect { ...this.props } className={ classNames( 'exporter__option-fieldset-select', this.props.className ) }>
				<option value="">{ this.props.defaultLabel }</option>
				{ options }
			</FormSelect>
		);
	}
}
