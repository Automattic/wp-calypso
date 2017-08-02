/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { Field } from 'redux-form';
import { omit } from 'lodash';

/**
 * Internal dependencies
 */
import FormSelect from 'components/forms/form-select';

class ReduxFormSelect extends Component {
	static propTypes = {
		name: PropTypes.string,
	};

	renderSelect = ( { input: { onChange, value } } ) => {
		const otherProps = omit( this.props, 'name' );

		return (
			<FormSelect
				{ ...otherProps }
				onChange={ this.updateSelect( onChange ) }
				value={ value } />
		);
	}

	updateSelect = onChange => event => onChange( event.target.value );

	render() {
		return (
			<Field
				{ ...this.props }
				component={ this.renderSelect }
				name={ this.props.name } />
		);
	}
}

export default ReduxFormSelect;
