import page from 'page';
import { useSelector } from 'react-redux';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { IntervalLength } from 'calypso/my-sites/email/email-providers-comparison/interval-length';
import EmailProvidersStackedComparison from 'calypso/my-sites/email/email-providers-stacked-comparison';
import { emailManagementPurchaseNewEmailAccount } from 'calypso/my-sites/email/paths';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import type { EmailProvidersStackedComparisonProps } from 'calypso/my-sites/email/email-providers-stacked-comparison';

const EmailProvidersStackedComparisonPage = (
	props: EmailProvidersStackedComparisonProps
): JSX.Element => {
	const currentRoute = useSelector( getCurrentRoute );
	const selectedSite = useSelector( getSelectedSite );

	const changeIntervalLength = (
		props: EmailProvidersStackedComparisonProps,
		newIntervalLength: IntervalLength
	) => {
		const { selectedDomainName, selectedEmailProviderSlug } = props;
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
					source: props.source,
					context: props.comparisonContext,
					provider: props.selectedEmailProviderSlug,
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
