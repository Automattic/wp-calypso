/**
 * External dependencies
 */

import React, { Component } from 'react';
import classNames from 'classnames';
import { head, values } from 'lodash';
import debugFactory from 'debug';
const debug = debugFactory( 'calypso:validate-fieldset' );

/**
 * Internal dependencies
 */
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormInputValidation from 'calypso/components/forms/form-input-validation';

/**
 * Style dependencies
 */
import './style.scss';

export default class ValidationFieldset extends Component {
	renderValidationNotice() {
		const validationElement = this.props.errorMessages && (
			<FormInputValidation
				isError={ true }
				isValid={ false }
				text={ head( values( this.props.errorMessages ) ) }
			/>
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
