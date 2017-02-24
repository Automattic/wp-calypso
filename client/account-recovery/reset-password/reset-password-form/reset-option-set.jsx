/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import classnames from 'classnames';

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
		disabled,
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
						className={ classnames( 'reset-password-form__email-option', name ) }
						value={ emailFieldValue }
						checked={ emailFieldValue === selectedResetOption }
						disabled={ disabled }
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
						className={ classnames( 'reset-password-form__sms-option', name ) }
						value={ smsFieldValue }
						checked={ smsFieldValue === selectedResetOption }
						disabled={ disabled }
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
