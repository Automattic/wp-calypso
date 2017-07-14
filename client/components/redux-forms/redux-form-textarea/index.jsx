/**
 * External dependencies
 */
import React, { PureComponent, PropTypes } from 'react';
import { Field } from 'redux-form';
import { omit } from 'lodash';

/**
 * Internal dependencies
 */
import FormTextarea from 'components/forms/form-textarea';

class ReduxFormTextarea extends PureComponent {
	static propTypes = {
		name: PropTypes.string,
	};

	renderTextarea = ( { input: { onChange, value } } ) => {
		const otherProps = omit( this.props, 'name' );

		return (
			<FormTextarea
				{ ...otherProps }
				onChange={ this.updateTextarea( onChange ) }
				value={ value }>
			</FormTextarea>
		);
	}

	updateTextarea = onChange => event => onChange( event.target.value );

	render() {
		return (
			<Field
				{ ...this.props }
				component={ this.renderTextarea }
				name={ this.props.name } />
		);
	}
}

export default ReduxFormTextarea;
