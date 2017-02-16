/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import FormTextInput from 'components/forms/form-text-input';
import FormLegend from 'components/forms/form-legend';
import FormButton from 'components/forms/form-button';

class ResetPasswordConfirmForm extends Component {
	render() {
		const {
			translate,
		} = this.props;

		return (
			<div className="reset-password-confirm-form">
				<h2>{ translate( 'Reset your password' ) }</h2>
				<Card>
					<FormLegend>{ translate( 'New password' ) }</FormLegend>
					<FormTextInput />
					<FormButton>{ translate( 'Generate strong password' ) }</FormButton>
					<p>{ translate( '{{a}}Great passwords{{/a}} use upper and lower case characters' +
							', numbers, and symbols like !/"$%&', { components: { a: <a href="#" /> }
						} ) }</p>
					<FormButton>{ translate( 'Reset Password' ) }</FormButton>
				</Card>
			</div>
		);
	}
}

export default localize( ResetPasswordConfirmForm );
