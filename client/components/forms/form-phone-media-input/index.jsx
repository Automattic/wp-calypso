/**
 * External dependencies
 */
import classnames from 'classnames';
import { omit } from 'lodash';
import React from 'react';

/**
 * Internal dependencies
 */
import FormInputValidation from 'components/forms/form-input-validation';
import FormLabel from 'components/forms/form-label';
import PhoneInput from 'components/phone-input';

export default class extends React.Component {
	static displayName = 'FormPhoneMediaInput';

	static defaultProps = {
		isError: false,
	};

	focus = () => this.phoneInput.numberInput.focus();

	setPhoneInput = ( ref ) => this.phoneInput = ref;

	render() {
		const classes = classnames( this.props.className, {
			'is-error': this.props.isError,
		} );

		return (
			<div className={ classnames( this.props.additionalClasses, 'phone' ) }>
				<div>
					<FormLabel htmlFor={ this.props.name }>
						{ this.props.label }
					</FormLabel>
					<PhoneInput
						{ ...omit( this.props, [ 'className', 'countryCode' ] ) }
						ref="input"
						setComponentReference={ this.setPhoneInput }
						countryCode={ this.props.countryCode.toUpperCase() }
						className={ classes }
					/>
				</div>
				{ this.props.errorMessage &&
					<FormInputValidation text={ this.props.errorMessage } isError /> }
			</div>
		);
	}
}
