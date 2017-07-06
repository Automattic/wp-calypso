/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { Field } from 'redux-form';
import { omit } from 'lodash';

/**
 * Internal dependencies
 */
import FormTextInput from 'components/forms/form-text-input';

class ReduxFormTextInput extends Component {
	static propTypes = {
		name: PropTypes.string,
	};

	renderTextInput = ( { input: { onChange, value } } ) => {
		const otherProps = omit( this.props, 'name' );

		return (
			<FormTextInput
				{ ...otherProps }
				onChange={ this.updateTextInput( onChange ) }
				value={ value } />
		);
	}

	updateTextInput = onChange => event => onChange( event.target.value );

	render() {
		return (
			<Field
				{ ...this.props }
				component={ this.renderTextInput }
				name={ this.props.name } />
		);
	}
}

export default ReduxFormTextInput;
