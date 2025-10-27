import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { BackToEmailsPrefix } from '../components/back-to-emails-prefix';

export default function MailboxesReady() {
	return (
		<PageLayout header={ <PageHeader prefix={ <BackToEmailsPrefix /> } /> } size="small">
			<div>hey</div>
		</PageLayout>
	);
}
