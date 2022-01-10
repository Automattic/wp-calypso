/* eslint-disable wpcalypso/jsx-classname-namespace */

import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useSelector } from 'react-redux';
import { BillingIntervalToggle } from 'calypso/my-sites/email/email-providers-comparison/billing-interval-toggle';
import ComparisonTable from 'calypso/my-sites/email/email-providers-comparison/in-depth/comparison-table';
import {
	professionalEmailFeatures,
	googleWorkspaceFeatures,
} from 'calypso/my-sites/email/email-providers-comparison/in-depth/data';
import { IntervalLength } from 'calypso/my-sites/email/email-providers-stacked-comparison/provider-cards/utils';
import { emailManagementInDepthComparison } from 'calypso/my-sites/email/paths';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import type { EmailProvidersInDepthComparisonProps } from 'calypso/my-sites/email/email-providers-comparison/in-depth/types';
import type { ReactElement } from 'react';

import './style.scss';

const EmailProvidersInDepthComparison = ( {
	selectedDomainName,
	selectedIntervalLength = IntervalLength.ANNUALLY,
}: EmailProvidersInDepthComparisonProps ): ReactElement => {
	const translate = useTranslate();

	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const currentRoute = useSelector( getCurrentRoute );

	const changeIntervalLength = ( newIntervalLength: IntervalLength ) => {
		if ( selectedSiteSlug === null ) {
			return;
		}

		page(
			emailManagementInDepthComparison(
				selectedSiteSlug,
				selectedDomainName,
				currentRoute,
				null,
				newIntervalLength
			)
		);
	};

	return (
		<>
			<h1 className="email-providers-in-depth-comparison__header">
				{ translate( 'Choose the right plan for you' ) }
			</h1>

			<div className="email-providers-in-depth-comparison__sub-header">
				{ translate( 'Try risk-free with a 14-day money back guarantee on all plans.' ) }
			</div>

			<BillingIntervalToggle
				intervalLength={ selectedIntervalLength }
				onIntervalChange={ changeIntervalLength }
			/>

			<ComparisonTable
				emailProviders={ [ professionalEmailFeatures, googleWorkspaceFeatures ] }
				intervalLength={ selectedIntervalLength }
				selectedDomainName={ selectedDomainName }
			/>
		</>
	);
};

export default EmailProvidersInDepthComparison;
