import { EmailAccount } from '@automattic/api-core';
import { useAuth } from '../../app/auth';
import { FIELD_PASSWORD_RESET_EMAIL } from '../entities/constants';
import { MailboxForm as MailboxFormEntity } from '../entities/mailbox-form';
import { FormFieldNames } from '../entities/types';
import { MailboxProvider } from '../types';

export const useCreateNewMailbox = ( {
	domainName,
	existingMailboxes,
	provider,
}: {
	domainName: string;
	existingMailboxes: EmailAccount[];
	provider: MailboxProvider;
} ) => {
	const { user } = useAuth();

	return () => {
		const mailbox = new MailboxFormEntity< MailboxProvider >(
			provider,
			domainName,
			( existingMailboxes ?? [] )
				.flatMap( ( emailAccount ) => emailAccount.emails )
				.map( ( emailBox ) => emailBox.mailbox )
		);

		// Set initial values
		Object.entries( {
			[ FIELD_PASSWORD_RESET_EMAIL ]: user.email,
		} ).forEach( ( [ fieldName, value ] ) => {
			mailbox.setFieldValue( fieldName as FormFieldNames, value );
		} );

		return mailbox;
	};
};
