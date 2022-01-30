import { ReactElement } from 'react';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import EmailProvidersStackedComparison from 'calypso/my-sites/email/email-providers-stacked-comparison/index';
import { emailManagementPurchaseNewEmailAccount } from 'calypso/my-sites/email/paths';
import type { EmailProvidersStackedComparisonProps } from 'calypso/my-sites/email/email-providers-stacked-comparison/index';

const EmailProvidersStackedComparisonPage = (
	props: EmailProvidersStackedComparisonProps
): ReactElement => {
	return (
		<>
			<PageViewTracker
				path={ emailManagementPurchaseNewEmailAccount( ':site', ':domain' ) }
				title="Email Comparison"
				properties={ {
					source: props.source,
					context: props.comparisonContext,
					provider: props.selectedEmailProviderSlug,
				} }
			/>
			<EmailProvidersStackedComparison { ...props } />
		</>
	);
};

export default EmailProvidersStackedComparisonPage;
