/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { Field } from 'redux-form';
import { omit } from 'lodash';

/**
 * Internal dependencies
 */
import FormToggle from 'components/forms/form-toggle/compact';

class ReduxFormToggle extends Component {
	static propTypes = {
		name: PropTypes.string,
		text: PropTypes.string,
	};

	renderToggle = text => ( { input: { onChange, value } } ) => {
		const otherProps = omit( this.props, [ 'name', 'text' ] );

		return (
			<FormToggle
				{ ...otherProps }
				checked={ value || false }
				onChange={ this.updateToggle( value, onChange ) }>
				{ text }
			</FormToggle>
		);
	}

	updateToggle = ( value, onChange ) => () => onChange( ! value );

	render() {
		return (
			<Field
				component={ this.renderToggle( this.props.text ) }
				name={ this.props.name } />
		);
	}
}

export default ReduxFormToggle;
