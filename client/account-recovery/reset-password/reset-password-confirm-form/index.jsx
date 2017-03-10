/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import { identity } from 'lodash';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import FormPasswordInput from 'components/forms/form-password-input';
import FormLabel from 'components/forms/form-label';
import FormButton from 'components/forms/form-button';
import { STRONG_PASSWORD } from 'lib/url/support';

const ResetPasswordConfirmForm = ( props ) => {
	const { translate } = props;

	return (
		<Card>
			<h2 className="reset-password-confirm-form__title">{ translate( 'Reset your password' ) }</h2>
			<FormLabel className="reset-password-confirm-form__text-input-label" htmlFor="password">
				{ translate( 'New password' ) }
			</FormLabel>
			<FormPasswordInput className="reset-password-confirm-form__password-input-field" id="password" />
			<FormButton className="reset-password-confirm-form__button generate-password-button" isPrimary={ false }>
				{ translate( 'Generate strong password' ) }
			</FormButton>
			<p className="reset-password-confirm-form__description">
				{ translate(
					'{{a}}Great passwords{{/a}} use upper and lower case characters, numbers, and symbols like {{em}}%(symbols)s{{/em}}.',
					{
						args: {
							symbols: '!/"$%&',
						},
						components: {
							a: <a href={ STRONG_PASSWORD } target="_blank" rel="noopener noreferrer" />,
							em: <em />,
						}
					}
				) }
			</p>
			<FormButton className="reset-password-confirm-form__button submit">
				{ translate( 'Reset Password' ) }
			</FormButton>
		</Card>
	);
};

ResetPasswordConfirmForm.defaultProps = {
	translate: identity,
};

export default localize( ResetPasswordConfirmForm );
