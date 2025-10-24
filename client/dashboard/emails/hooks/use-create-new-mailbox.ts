import { EmailAccount } from '@automattic/api-core';
import { useAuth } from '../../app/auth';
import {
	FIELD_FIRSTNAME,
	FIELD_IS_ADMIN,
	FIELD_LASTNAME,
	FIELD_MAILBOX,
	FIELD_NAME,
	FIELD_PASSWORD,
	FIELD_PASSWORD_RESET_EMAIL,
} from '../entities/constants';
import { MailboxForm as MailboxFormEntity } from '../entities/mailbox-form';
import { FormFieldNames, MutableFormFieldNames, SupportedEmailProvider } from '../entities/types';

type HiddenFieldNames = Exclude<
	MutableFormFieldNames,
	typeof FIELD_MAILBOX | typeof FIELD_PASSWORD
>;

const possibleHiddenFieldNames: HiddenFieldNames[] = [
	FIELD_NAME,
	FIELD_FIRSTNAME,
	FIELD_LASTNAME,
	FIELD_IS_ADMIN,
	FIELD_PASSWORD_RESET_EMAIL,
];

export const useCreateNewMailbox = ( {
	domainName,
	existingMailboxes,
}: {
	domainName: string;
	existingMailboxes: EmailAccount[];
} ) => {
	const { user } = useAuth();

	return () => {
		const mailbox = new MailboxFormEntity< SupportedEmailProvider >(
			'titan',
			domainName,
			( existingMailboxes ?? [] )
				.flatMap( ( emailAccount ) => emailAccount.emails )
				.map( ( emailBox ) => emailBox.mailbox )
		);

		possibleHiddenFieldNames.forEach( ( fieldName ) => {
			mailbox.setFieldIsVisible( fieldName, false );
			mailbox.setFieldIsRequired( fieldName, false );
		} );

		// Set initial values
		Object.entries( {
			[ FIELD_PASSWORD_RESET_EMAIL ]: user.email,
		} ).forEach( ( [ fieldName, value ] ) => {
			mailbox.setFieldValue( fieldName as FormFieldNames, value );
		} );

		return mailbox;
	};
};
