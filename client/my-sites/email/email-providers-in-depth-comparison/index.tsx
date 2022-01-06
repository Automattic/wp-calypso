import { useTranslate } from 'i18n-calypso';
import ComparisonTable from 'calypso/my-sites/email/email-providers-in-depth-comparison/comparison-table';
import {
	professionalEmailFeatures,
	googleWorkspaceFeatures,
} from 'calypso/my-sites/email/email-providers-in-depth-comparison/data';
import type { ReactElement } from 'react';

import './style.scss';

const EmailProvidersInDepthComparison = (): ReactElement => {
	const translate = useTranslate();

	return (
		<>
			<h1 className="email-providers-in-depth-comparison__header">
				{ translate( 'See how they compare' ) }
			</h1>

			<ComparisonTable emailProviders={ [ professionalEmailFeatures, googleWorkspaceFeatures ] } />
		</>
	);
};

export default EmailProvidersInDepthComparison;
