/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormLabel from 'components/forms/form-label';
import FormRadio from 'components/forms/form-radio';

const getResetOptionDisplayString = ( optionName, translate ) => {
	switch ( optionName ) {
		case 'primary':
			return translate( 'main', {
				comment: 'It is about which way a user wants to reset the password. e.g. main email, recovery email.',
			} );
		case 'secondary':
			return translate( 'recovery', {
				comment: 'It is about which way a user wants to reset the password. e.g. main email, recovery email.',
			} );
		default:
			return '';
	}
};

const ResetOptionSet = ( props ) => {
	const {
		email,
		sms,
		name,
		translate,
		onOptionChanged,
		selectedResetOption,
	} = props;

	const emailFieldValue = name + '_email';
	const smsFieldValue = name + '_sms';
	const optionDisplayName = getResetOptionDisplayString( name, translate );

	return (
		<div>
			{ email && (
				<FormLabel>
					<FormRadio
						className="reset-password-form__email-option"
						value={ emailFieldValue }
						checked={ emailFieldValue === selectedResetOption }
						onChange={ onOptionChanged } />
					<span>
						{ translate(
							'Email a reset link to {{strong}}your %(optionName)s email address{{/strong}}',
							{
								components: { strong: <strong /> },
								args: { optionName: optionDisplayName },
								comment: 'The %(optionName)s can be "main" or "recovery".',
							}
						) }
					</span>
				</FormLabel> )
			}
			{ sms && (
				<FormLabel>
					<FormRadio
						className="reset-password-form__sms-option"
						value={ smsFieldValue }
						checked={ smsFieldValue === selectedResetOption }
						onChange={ onOptionChanged } />
					<span>
						{ translate(
							'Send a reset code to {{strong}}your %(optionName)s phone{{/strong}}',
							{
								components: { strong: <strong /> },
								args: { optionName: optionDisplayName },
								comment: 'The %(optionName)s can be "main" or "recovery".',
							}
						) }
					</span>
				</FormLabel> )
			}
		</div>
	);
};

export default localize( ResetOptionSet );
