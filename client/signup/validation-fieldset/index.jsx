import classNames from 'classnames';
import debugFactory from 'debug';
import { values } from 'lodash';
import { Component } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormInputValidation from 'calypso/components/forms/form-input-validation';
import './style.scss';
const debug = debugFactory( 'calypso:validate-fieldset' );

export default class ValidationFieldset extends Component {
	renderValidationNotice() {
		const validationElement = this.props.errorMessages && (
			<FormInputValidation
				isError={ true }
				isValid={ false }
				text={ values( this.props.errorMessages )[ 0 ] }
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
