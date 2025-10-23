import {
	__experimentalVStack as VStack,
	__experimentalInputControl as InputControl,
} from '@wordpress/components';
import { Icon, info } from '@wordpress/icons';
import { useEffect, useState } from 'react';
import { Text } from '../../../components/text';
import { MailboxForm as MailboxFormEntity } from '../../entities/mailbox-form';
import {
	MailboxFormFieldBase,
	SupportedEmailProvider,
	TitanMailboxFormFields,
	TextMailboxFormField,
} from '../../entities/types';
import type { InputControlProps } from '@wordpress/components/build-types/input-control/types';

export const MailboxInput = ( {
	fieldName,
	mailboxEntity,
	onBlur,
	onChange,
	lowerCaseChangeValue = false,
	...inputControlProps
}: {
	fieldName: 'mailbox' | 'password' | 'passwordResetEmail';
	mailboxEntity: MailboxFormEntity< SupportedEmailProvider >;
	lowerCaseChangeValue?: boolean;
	onBlur: ( args: { field: MailboxFormFieldBase< string > } ) => void;
	onChange: ( args: {
		value: string | undefined;
		field: MailboxFormFieldBase< string >;
		lowerCaseChangeValue?: boolean;
	} ) => void;
} & Omit< InputControlProps, 'onBlur' | 'onChange' > ) => {
	const originalField = ( mailboxEntity.formFields as TitanMailboxFormFields )[
		fieldName
	] as TextMailboxFormField;

	const [ { field }, setFieldState ] = useState( { field: originalField } );

	useEffect( () => {
		field.dispatchState = () => {
			setFieldState( { field } );
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps -- We only want this to run once
	}, [] );

	return (
		<VStack>
			<InputControl
				__next40pxDefaultSize
				value={ mailboxEntity.getFieldValue( fieldName ) }
				onBlur={ () => {
					onBlur( { field: originalField } );
				} }
				onChange={ ( value ) => {
					onChange( {
						value,
						field: originalField,
						lowerCaseChangeValue,
					} );
				} }
				{ ...inputControlProps }
			/>

			{ mailboxEntity.getFieldError( fieldName ) && (
				<Text className="error-message" as="p" intent="error">
					<Icon size={ 20 } icon={ info } />
					<div>{ mailboxEntity.getFieldError( fieldName ) }</div>
				</Text>
			) }
		</VStack>
	);
};
