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

	// The password reset email must live on a different domain than the mailbox.
	const passwordResetEmail = user.email?.toLowerCase().endsWith( `@${ domainName.toLowerCase() }` )
		? ''
		: user.email;

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
			[ FIELD_PASSWORD_RESET_EMAIL ]: passwordResetEmail,
		} ).forEach( ( [ fieldName, value ] ) => {
			mailbox.setFieldValue( fieldName as FormFieldNames, value );
		} );

		return mailbox;
	};
};
