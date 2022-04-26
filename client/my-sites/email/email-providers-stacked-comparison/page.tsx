import { MailboxForm } from 'calypso/my-sites/email/form/mailboxes';
import { EmailProvider, TitanMailboxFormFields } from 'calypso/my-sites/email/form/mailboxes/types';

const EmailProvidersStackedComparisonPage = (): JSX.Element => {
	const mb = new MailboxForm( EmailProvider.Titan, 'rodent.com', [] );
	const formFields: TitanMailboxFormFields = mb.formFields;

	formFields.mailbox.value = 'formica-ca';
	if ( formFields.alternativeEmail ) {
		formFields.alternativeEmail.value = 'com@rodent.com';
	}

	mb.validate();
	window.console.log( 'ZKK', mb.provider, formFields.password.error );
	// mb.clearErrors();
	window.console.log( 'ZKK', mb.provider, formFields );

	return <></>;
};

export default EmailProvidersStackedComparisonPage;
