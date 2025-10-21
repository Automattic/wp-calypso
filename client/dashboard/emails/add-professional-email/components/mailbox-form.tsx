import {
	__experimentalVStack as VStack,
	Button,
	__experimentalInputControlSuffixWrapper as InputControlSuffixWrapper,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { seen, unseen } from '@wordpress/icons';
import { useState } from 'react';
import { ButtonStack } from '../../../components/button-stack';
import { Text } from '../../../components/text';
import {
	FIELD_FIRSTNAME,
	FIELD_MAILBOX,
	FIELD_NAME,
	FIELD_PASSWORD,
	FIELD_PASSWORD_RESET_EMAIL,
} from '../../entities/constants';
import { MailboxForm as MailboxFormEntity } from '../../entities/mailbox-form';
import { MailboxFormFieldBase, SupportedEmailProvider } from '../../entities/types';
import { useDomainFromUrlParam } from '../../hooks/use-domain-from-url-param';
import { sanitizeMailboxValue } from '../../utils/sanitize-mailbox-value';
import { MailboxInput } from './mailbox-input';

import './style.scss';

export const MailboxForm = ( {
	mailboxEntity,
	disabled = false,
	removeForm = undefined,
}: {
	mailboxEntity: MailboxFormEntity< SupportedEmailProvider >;
	disabled: boolean;
	removeForm?: () => void;
} ) => {
	const { domainName } = useDomainFromUrlParam();

	const [ isPasswordResetEmailVisible, setIsPasswordResetEmailVisible ] = useState( false );
	const [ isPasswordVisible, setIsPasswordVisible ] = useState( false );

	const onRequestFieldValidation = ( field: MailboxFormFieldBase< string > ) =>
		mailboxEntity.validateField( field.fieldName );
	const onFieldValueChanged = ( field: MailboxFormFieldBase< string > ) => {
		if ( ! [ FIELD_FIRSTNAME, FIELD_NAME ].includes( field.fieldName ) ) {
			return;
		}
		if ( mailboxEntity.getIsFieldTouched( FIELD_MAILBOX ) ) {
			return;
		}

		mailboxEntity.setFieldValue( FIELD_MAILBOX, sanitizeMailboxValue( field.value ) );
		mailboxEntity.validateField( FIELD_MAILBOX );
	};

	const onChange = ( {
		value,
		field,
		lowerCaseChangeValue = false,
	}: {
		value: string | undefined;
		field: MailboxFormFieldBase< string >;
		lowerCaseChangeValue?: boolean;
	} ) => {
		if ( value && lowerCaseChangeValue ) {
			value = value.toLowerCase();
		}
		field.value = value || '';

		// Validate the field on the fly if there was already an error, or the field was already touched
		if ( field.error || field.isTouched ) {
			onRequestFieldValidation( field );
		}

		field.dispatchState();

		onFieldValueChanged( field );
	};

	return (
		<VStack spacing={ 4 }>
			<MailboxInput
				fieldName={ FIELD_MAILBOX }
				mailboxEntity={ mailboxEntity }
				label={ __( 'Email address' ) }
				disabled={ disabled }
				lowerCaseChangeValue
				suffix={
					<InputControlSuffixWrapper>
						<Text variant="muted">{ `@${ domainName }` }</Text>
					</InputControlSuffixWrapper>
				}
				onChange={ onChange }
			/>

			<VStack>
				<MailboxInput
					fieldName={ FIELD_PASSWORD }
					type={ isPasswordVisible ? 'text' : 'password' }
					mailboxEntity={ mailboxEntity }
					label={ __( 'Password' ) }
					disabled={ disabled }
					suffix={
						<InputControlSuffixWrapper>
							<Button
								icon={ isPasswordVisible ? unseen : seen }
								onClick={ () => {
									setIsPasswordVisible( ! isPasswordVisible );
								} }
							/>
						</InputControlSuffixWrapper>
					}
					// Hint to LastPass not to attempt autofill
					data-lpignore="true"
					onChange={ onChange }
				/>

				{ ! isPasswordResetEmailVisible && (
					<Text variant="muted">
						{ createInterpolateElement(
							sprintf(
								// Translators: %(userEmail)s is the email address that the user has currently configured as their password reset email.
								__(
									'Your password reset email is <strong>%(userEmail)s</strong>. <passwordChangeLink>Change it</passwordChangeLink>.'
								),
								{ userEmail: mailboxEntity.getFieldValue( FIELD_PASSWORD_RESET_EMAIL ) }
							),
							{
								strong: <strong />,
								passwordChangeLink: (
									<a
										href="#change-password"
										onClick={ ( e ) => {
											e.preventDefault();
											mailboxEntity.setFieldIsRequired( FIELD_PASSWORD_RESET_EMAIL, true );
											setIsPasswordResetEmailVisible( ( prev ) => ! prev );
										} }
									/>
								),
							}
						) }
					</Text>
				) }
			</VStack>

			{ isPasswordResetEmailVisible && (
				<MailboxInput
					fieldName={ FIELD_PASSWORD_RESET_EMAIL }
					mailboxEntity={ mailboxEntity }
					label={ __( 'Password reset email address' ) }
					disabled={ disabled }
					onChange={ onChange }
				/>
			) }

			{ removeForm && (
				<ButtonStack justify="flex-start">
					<Button
						__next40pxDefaultSize
						isDestructive
						variant="secondary"
						onClick={ removeForm }
						disabled={ disabled }
					>
						{ __( 'Remove mailbox' ) }
					</Button>
				</ButtonStack>
			) }
		</VStack>
	);
};
