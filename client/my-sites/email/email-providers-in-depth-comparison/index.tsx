import { FunctionComponent } from 'react';
import ComparisonTable from 'calypso/my-sites/email/email-providers-in-depth-comparison/comparison-table';
import {
	professionalEmailFeatures,
	googleWorkspaceFeatures,
} from 'calypso/my-sites/email/email-providers-in-depth-comparison/data';

type EmailProvidersInDepthComparisonProps = {
	comparisonContext: string;
	selectedDomainName: string;
	siteName: string;
	source: string;
};

const EmailProvidersInDepthComparison: FunctionComponent< EmailProvidersInDepthComparisonProps > = () => {
	return (
		<ComparisonTable emailProviders={ [ professionalEmailFeatures, googleWorkspaceFeatures ] } />
	);
};

export default EmailProvidersInDepthComparison;
