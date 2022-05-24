import { MailboxForm } from 'calypso/my-sites/email/form/mailboxes';
import { MailboxField } from 'calypso/my-sites/email/form/mailboxes/components/field';
import { EmailProvider } from 'calypso/my-sites/email/form/mailboxes/types';

export const MailForm = () => {
	const domainName = 'example.com';
	const mailbox = new MailboxForm< EmailProvider >( EmailProvider.Titan, domainName );
	mailbox.formFields.password.value = 'Hello';

	return (
		<div>
			<MailboxField
				domains={ [] }
				field={ mailbox.formFields.password }
				notifyFieldExited={ () => true }
				notifyFieldValueChanged={ () => true }
				selectedDomainName={ domainName }
			>
				<div>Croak</div>
			</MailboxField>
		</div>
	);
};

export default MailForm;
