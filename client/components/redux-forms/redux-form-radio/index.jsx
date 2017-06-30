/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { Field } from 'redux-form';

/**
 * Internal dependencies
 */
import FormRadio from 'components/forms/form-radio';

class ReduxFormRadio extends Component {
	static propTypes = {
		name: PropTypes.string,
		value: PropTypes.string,
	};

	renderRadio = defaultValue => ( { input: { name, onChange, value } } ) => (
		<FormRadio
			checked={ value === defaultValue }
			name={ name }
			onChange={ this.updateRadio( onChange ) }
			value={ defaultValue } />
	)

	updateRadio = onChange => event => onChange( event.target.value );

	render() {
		return <Field component={ this.renderRadio( this.props.value ) } name={ this.props.name } />;
	}
}

export default ReduxFormRadio;
