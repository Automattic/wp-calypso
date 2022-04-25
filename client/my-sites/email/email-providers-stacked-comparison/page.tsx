import { MailboxFormFactory, EmailProvider } from 'calypso/my-sites/email/form/mailboxes/types';

const EmailProvidersStackedComparisonPage = (): JSX.Element => {
	const mb = MailboxFormFactory.create( EmailProvider.Google );
	window.console.log( 'ZKK', mb.password.error );
	mb.validateAll();
	window.console.log( 'ZKK', mb.provider, mb.password.error );
	mb.clearErrors();
	window.console.log( 'ZKK', mb.provider, mb.password.error );

	return <></>;
};

export default EmailProvidersStackedComparisonPage;
