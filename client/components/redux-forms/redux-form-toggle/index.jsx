/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { Field } from 'redux-form';

/**
 * Internal dependencies
 */
import FormToggle from 'components/forms/form-toggle/compact';

class ReduxFormToggle extends Component {
	static propTypes = {
		name: PropTypes.string,
		text: PropTypes.string,
	};

	renderToggle = text => ( { input: { onChange, value } } ) => (
		<FormToggle
			checked={ value || false }
			onChange={ this.updateToggle( value, onChange ) }>
			{ text }
		</FormToggle>
	)

	updateToggle = ( value, onChange ) => () => onChange( ! value );

	render() {
		return <Field component={ this.renderToggle( this.props.text ) } name={ this.props.name } />;
	}
}

export default ReduxFormToggle;
