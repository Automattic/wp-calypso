import page from 'page';
import { useSelector } from 'react-redux';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { IntervalLength } from 'calypso/my-sites/email/email-providers-comparison/interval-length';
import EmailProvidersStackedComparison from 'calypso/my-sites/email/email-providers-stacked-comparison';
import { emailManagementPurchaseNewEmailAccount } from 'calypso/my-sites/email/paths';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { getSelectedSite } from 'calypso/state/ui/selectors';

export type EmailProvidersStackedComparisonPageProps = {
	comparisonContext: string;
	selectedDomainName: string;
	selectedEmailProviderSlug?: string;
	selectedIntervalLength?: IntervalLength;
	source: string;
};

const EmailProvidersStackedComparisonPage = (
	props: EmailProvidersStackedComparisonPageProps
): JSX.Element => {
	const { comparisonContext, selectedDomainName, selectedEmailProviderSlug, source } = props;

	const currentRoute = useSelector( getCurrentRoute );
	const selectedSite = useSelector( getSelectedSite );

	const changeIntervalLength = ( newIntervalLength: IntervalLength ) => {
		page(
			emailManagementPurchaseNewEmailAccount(
				selectedSite?.slug ?? '',
				selectedDomainName,
				currentRoute,
				null,
				selectedEmailProviderSlug,
				newIntervalLength
			)
		);
	};

	return (
		<>
			<PageViewTracker
				path={ emailManagementPurchaseNewEmailAccount( ':site', ':domain' ) }
				title="Email Comparison"
				properties={ {
					source: source,
					context: comparisonContext,
					provider: selectedEmailProviderSlug,
				} }
			/>

			<EmailProvidersStackedComparison
				{ ...props }
				onIntervalLengthChange={ changeIntervalLength }
			/>
		</>
	);
};

export default EmailProvidersStackedComparisonPage;
