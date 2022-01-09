import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { BillingIntervalToggle } from 'calypso/my-sites/email/billing-interval-toggle';
import ComparisonTable from 'calypso/my-sites/email/email-providers-in-depth-comparison/comparison-table';
import {
	professionalEmailFeatures,
	googleWorkspaceFeatures,
} from 'calypso/my-sites/email/email-providers-in-depth-comparison/data';
import { IntervalLength } from 'calypso/my-sites/email/email-providers-stacked-comparison/provider-cards/utils';
import type { EmailProvidersInDepthComparisonProps } from 'calypso/my-sites/email/email-providers-in-depth-comparison/types';
import type { ReactElement } from 'react';

import './style.scss';

const EmailProvidersInDepthComparison = ( {
	selectedDomainName,
	selectedIntervalLength,
}: EmailProvidersInDepthComparisonProps ): ReactElement => {
	const translate = useTranslate();

	const [ intervalLength, setIntervalLength ] = useState( () => {
		if ( selectedIntervalLength === null ) {
			return IntervalLength.ANNUALLY;
		}

		return selectedIntervalLength;
	} );

	return (
		<>
			<h1 className="email-providers-in-depth-comparison__header">
				{ translate( 'Choose the right plan for you' ) }
			</h1>

			<div className="email-providers-in-depth-comparison__sub-header">
				{ translate( 'Try risk-free with a 14-day money back guarantee on all plans.' ) }
			</div>

			<BillingIntervalToggle
				intervalLength={ intervalLength }
				onIntervalChange={ ( newIntervalLength: IntervalLength ) =>
					setIntervalLength( newIntervalLength )
				}
			/>

			<ComparisonTable
				emailProviders={ [ professionalEmailFeatures, googleWorkspaceFeatures ] }
				intervalLength={ intervalLength }
				selectedDomainName={ selectedDomainName }
			/>
		</>
	);
};

export default EmailProvidersInDepthComparison;
