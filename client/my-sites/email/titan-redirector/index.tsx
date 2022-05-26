import { MailboxForm } from 'calypso/my-sites/email/form/mailboxes';
import { MailboxFormWrapper } from 'calypso/my-sites/email/form/mailboxes/components/form';
import { EmailProvider } from 'calypso/my-sites/email/form/mailboxes/types';

const handleSubmit = ( mailbox: MailboxForm< EmailProvider > ) => {
	alert( mailbox.hasErrors() );
};

export const Form = () => {
	return (
		<div>
			<MailboxFormWrapper
				onSubmit={ handleSubmit }
				provider={ EmailProvider.Google }
				selectedDomainName={ 'example.com' }
			/>
		</div>
	);
};

export default Form;
