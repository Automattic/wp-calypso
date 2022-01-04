import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import ComparisonTable from 'calypso/my-sites/email/email-providers-in-depth-comparison/comparison-table';
import {
	professionalEmailFeatures,
	googleWorkspaceFeatures,
} from 'calypso/my-sites/email/email-providers-in-depth-comparison/data';
import type { EmailProvidersInDepthComparisonProps } from 'calypso/my-sites/email/email-providers-in-depth-comparison/types';

import './style.scss';

const EmailProvidersInDepthComparison: FunctionComponent< EmailProvidersInDepthComparisonProps > = () => {
	const translate = useTranslate();

	return (
		<>
			<h1 className="email-providers-in-depth-comparison__header wp-brand-font">
				{ translate( 'See how they compare' ) }
			</h1>

			<ComparisonTable emailProviders={ [ professionalEmailFeatures, googleWorkspaceFeatures ] } />
		</>
	);
};

export default EmailProvidersInDepthComparison;
