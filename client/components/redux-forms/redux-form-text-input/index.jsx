/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { Field } from 'redux-form';

/**
 * Internal dependencies
 */
import FormTextInput from 'components/forms/form-text-input';

class ReduxFormTextInput extends Component {
	static propTypes = {
		name: PropTypes.string,
	};

	renderTextInput = ( { input: { onChange, value } } ) => (
		<FormTextInput
			{ ...this.props }
			onChange={ this.updateTextInput( onChange ) }
			value={ value } />
	)

	updateTextInput = onChange => event => onChange( event.target.value );

	render() {
		return <Field component={ this.renderTextInput } name={ this.props.name } />;
	}
}

export default ReduxFormTextInput;
