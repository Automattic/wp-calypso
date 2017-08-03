/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';

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
		displayStrings,
		disabled,
		onOptionChanged,
		selectedResetOption,
	} = props;

	const emailFieldValue = name + '_email';
	const smsFieldValue = name + '_sms';

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
					<span>{ displayStrings.email }</span>
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
					<span>{ displayStrings.sms }</span>
				</FormLabel> )
			}
		</div>
	);
};

export default ResetOptionSet;
