import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import EmailHome from 'calypso/my-sites/email/email-management/email-home';
import { emailManagement } from 'calypso/my-sites/email/paths';

type EmailManagementHomePageProps = {
	selectedDomainName: string;
	source: string;
};

const EmailManagementHomePage = ( props: EmailManagementHomePageProps ): JSX.Element => {
	return (
		<>
			<PageViewTracker
				path={ emailManagement( ':site', props.selectedDomainName ? ':domain' : null ) }
				title="Email Home"
				properties={ { source: props.source } }
			/>
			<EmailHome { ...props } />
		</>
	);
};

export default EmailManagementHomePage;
