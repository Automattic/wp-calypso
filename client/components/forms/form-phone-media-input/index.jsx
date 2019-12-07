/** @format */

/**
 * External dependencies
 */

import React from 'react';
import classnames from 'classnames';
import { omit } from 'lodash';

/**
 * Internal dependencies
 */
import PhoneInput from 'components/phone-input';
import FormLabel from 'components/forms/form-label';
import FormInputValidation from 'components/forms/form-input-validation';

export default class extends React.Component {
	static displayName = 'FormPhoneMediaInput';

	static defaultProps = {
		isError: false,
	};

	focus = () => this.phoneInput.numberInput.focus();

	setPhoneInput = ref => ( this.phoneInput = ref );

	render() {
		return (
			<div className={ classnames( this.props.additionalClasses, 'phone' ) }>
				<div>
					<FormLabel htmlFor={ this.props.name }>{ this.props.label }</FormLabel>
					<PhoneInput
						{ ...omit( this.props, [ 'className', 'countryCode' ] ) }
						setComponentReference={ this.setPhoneInput }
						countryCode={ this.props.countryCode.toUpperCase() }
						className={ this.props.className }
						isError={ this.props.isError }
						disabled={ this.props.disabled }
					/>
				</div>
				{ this.props.errorMessage && (
					<FormInputValidation text={ this.props.errorMessage } isError />
				) }
			</div>
		);
	}
}
