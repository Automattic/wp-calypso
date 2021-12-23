import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import ComparisonTable from 'calypso/my-sites/email/email-providers-in-depth-comparison/comparison-table';
import {
	emailForwardingFeatures,
	professionalEmailFeatures,
	googleWorkspaceFeatures,
} from 'calypso/my-sites/email/email-providers-in-depth-comparison/data';

import './style.scss';

type EmailProvidersInDepthComparisonProps = {
	comparisonContext: string;
	selectedDomainName: string;
	siteName: string;
	source: string;
};

const EmailProvidersInDepthComparison: FunctionComponent< EmailProvidersInDepthComparisonProps > = () => {
	const translate = useTranslate();
	return (
		<>
			<h1 className="email-providers-in-depth-comparison__header wp-brand-font">
				{ translate( 'See how they compare' ) }
			</h1>
			<ComparisonTable
				className="email-providers-in-depth-comparison__main"
				emailProviders={ [
					professionalEmailFeatures,
					googleWorkspaceFeatures,
					emailForwardingFeatures,
				] }
				showFeatureNames={ true }
			/>
			<div className="email-providers-in-depth-comparison__button-container">
				<Button className="email-providers-in-depth-comparison__button" primary>
					{ translate( 'Get started' ) }
				</Button>
			</div>
		</>
	);
};

export default EmailProvidersInDepthComparison;
