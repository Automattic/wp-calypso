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
import { STRONG_PASSWORD } from 'lib/url/support';

class ResetPasswordConfirmForm extends Component {
	render() {
		const {
			translate,
		} = this.props;

		return (
			<Card>
				<h2 className="reset-password-confirm-form__title">{ translate( 'Reset your password' ) }</h2>
				<FormLegend>{ translate( 'New password' ) }</FormLegend>
				<a href="#">{ translate( 'Hide' ) }</a>
				<FormTextInput />
				<FormButton className="reset-password-confirm-form__button generate-password-button" isPrimary={ false }>
					{ translate( 'Generate strong password' ) }
				</FormButton>
				<p className="reset-password-confirm-form__description">
					{ translate(
						'{{a}}Great passwords{{/a}} use upper and lower case characters, numbers, and symbols like !/"$%&',
						{
							components: {
								a: <a href={ STRONG_PASSWORD } target="_blank" rel="noopener noreferrer" />
							}
						}
					) }
				</p>
				<FormButton className="reset-password-confirm-form__button submit">
					{ translate( 'Reset Password' ) }
				</FormButton>
			</Card>
		);
	}
}

export default localize( ResetPasswordConfirmForm );
