/**
 * External dependencies
 */
import classNames from 'classnames';
import debugFactory from 'debug';
import { head, values } from 'lodash';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import FormFieldset from 'components/forms/form-fieldset';
import FormInputValidation from 'components/forms/form-input-validation';

const debug = debugFactory( 'calypso:validate-fieldset' );

export default class ValidationFieldset extends Component {
	renderValidationNotice() {
		const validationElement = this.props.errorMessages && (
			<FormInputValidation
				isError={ true }
				isValid={ false }
				text={ head( values( this.props.errorMessages ) ) } />
		);

		return <div className="validation-fieldset__validation-message">{ validationElement }</div>;
	}

	render() {
		const classes = classNames( 'validation-fieldset', this.props.className );

		debug( 'render validation fieldset' );

		return (
			<FormFieldset className={ classes }>
				{ this.props.children }
				{ this.renderValidationNotice() }
			</FormFieldset>
		);
	}
}
