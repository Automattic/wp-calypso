import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import SectionHeader from 'calypso/components/section-header';
import { getTitanProductName } from 'calypso/lib/titan';
import EmailHeader from 'calypso/my-sites/email/email-header';
import { MailboxForm } from 'calypso/my-sites/email/form/mailboxes';
import { NewMailBoxList } from 'calypso/my-sites/email/form/mailboxes/components/list';
import { EmailProvider } from 'calypso/my-sites/email/form/mailboxes/types';

const onSubmit = ( mailboxes: MailboxForm< EmailProvider >[] ) => {
	mailboxes.forEach( ( mailbox ) => {
		window.console.log( mailbox.isValid(), mailbox );
	} );
};

interface TestComponentProps {
	selectedDomainName: string;
}

const TestComponent = ( {
	selectedDomainName = 'olasenitest1-unify5.com',
}: TestComponentProps ): JSX.Element => {
	const translate = useTranslate();

	return (
		<>
			<Main wideLayout={ true }>
				<DocumentHead title={ translate( 'Add New Mailboxes' ) } />

				<EmailHeader />

				<HeaderCake>{ getTitanProductName() + ': ' + selectedDomainName }</HeaderCake>

				<SectionHeader label={ translate( 'Add New Mailboxes' ) } />

				<Card>
					<NewMailBoxList
						onSubmit={ onSubmit }
						provider={ EmailProvider.Titan }
						selectedDomainName={ selectedDomainName }
						showAddNewMailboxButton
						showCancelButton
						submitActionText={ translate( 'Complete setup' ) }
					/>
				</Card>
			</Main>
		</>
	);
};

export default TestComponent;
