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

const ResetOptionSet = ( props ) => {
	const {
		email,
		sms,
		name,
		translate,
		onOptionChanged,
		selectedResetOption,
	} = props;

	const emailFieldValue = name + '-email';
	const smsFieldValue = name + '-sms';

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
							'Email a reset link to {{strong}}your main email address{{/strong}}',
							{ components: { strong: <strong /> } }
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
							'Send a reset code to {{strong}}your phone{{/strong}}',
							{ components: { strong: <strong /> } }
						) }
					</span>
				</FormLabel> )
			}
		</div>
	);
};

export default localize( ResetOptionSet );
