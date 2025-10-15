import {
	__experimentalVStack as VStack,
	__experimentalInputControl as InputControl,
} from '@wordpress/components';
import { Icon, info } from '@wordpress/icons';
import { Text } from '../../../components/text';
import { MailboxForm as MailboxFormEntity } from '../../entities/mailbox-form';
import { FormFieldNames, MailboxFormFieldBase, SupportedEmailProvider } from '../../entities/types';
import type { InputControlProps } from '@wordpress/components/build-types/input-control/types';

export const MailboxInput = ( {
	fieldName,
	mailboxEntity,
	onChange,
	lowerCaseChangeValue = false,
	...inputControlProps
}: {
	fieldName: FormFieldNames;
	mailboxEntity: MailboxFormEntity< SupportedEmailProvider >;
	lowerCaseChangeValue?: boolean;
	onChange: ( args: {
		value: string | undefined;
		field: MailboxFormFieldBase< string >;
		lowerCaseChangeValue?: boolean;
	} ) => void;
} & Omit< InputControlProps, 'onChange' > ) => {
	return (
		<VStack>
			<InputControl
				__next40pxDefaultSize
				value={ mailboxEntity.getFieldValue( fieldName ) }
				onChange={ ( value ) => {
					onChange( {
						value,
						field: mailboxEntity.formFields[ fieldName ],
						lowerCaseChangeValue,
					} );
				} }
				{ ...inputControlProps }
			/>

			{ mailboxEntity.getFieldError( fieldName ) && (
				<Text className="error-message" as="p" intent="error">
					<Icon size={ 20 } icon={ info } />
					{ mailboxEntity.getFieldError( fieldName ) }
				</Text>
			) }
		</VStack>
	);
};
