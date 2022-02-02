import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import EmailManagementHome from 'calypso/my-sites/email/email-management/email-home';
import { emailManagement } from 'calypso/my-sites/email/paths';

const EmailManagementHomePage = ( { source, selectedDomainName } ) => {
	return (
		<>
			<PageViewTracker
				path={ emailManagement( ':site', selectedDomainName ? ':domain' : null ) }
				title="Email Home"
				properties={ { source } }
			/>
			<EmailManagementHome source={ source } selectedDomainName={ selectedDomainName } />
		</>
	);
};

export default EmailManagementHomePage;
