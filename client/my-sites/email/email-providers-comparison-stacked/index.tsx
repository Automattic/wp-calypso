import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';

import './style.scss';

type EmailProvidersComparisonStackedProps = {
	comparisonContext: string;
	selectedDomainName: string;
	source: string;
};

const EmailProvidersComparisonStacked: FunctionComponent< EmailProvidersComparisonStackedProps > = () => {
	const translate = useTranslate();

	return (
		<h1 className="email-providers-comparison-stacked__header wp-brand-font">
			{ translate( 'Pick and email solution' ) }
		</h1>
	);
};

export default EmailProvidersComparisonStacked;
