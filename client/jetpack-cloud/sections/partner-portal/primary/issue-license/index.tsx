import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import CardHeading from 'calypso/components/card-heading';
import AssignLicenseStepProgress from 'calypso/jetpack-cloud/sections/partner-portal/assign-license-step-progress';
import IssueMultipleLicensesForm from 'calypso/jetpack-cloud/sections/partner-portal/issue-multiple-licenses-form';
import TotalCost from 'calypso/jetpack-cloud/sections/partner-portal/primary/total-cost';
import Layout from '../../layout';
import LayoutBody from '../../layout/body';
import LayoutHeader from '../../layout/header';
import LayoutTop from '../../layout/top';
import { AssignLicenceProps } from '../../types';

import './styles.scss';

export default function IssueLicense( { selectedSite, suggestedProduct }: AssignLicenceProps ) {
	const translate = useTranslate();

	useEffect( () => {
		const layoutClass = 'layout__content--partner-portal-issue-license';
		const content = document.getElementById( 'content' );

		if ( content ) {
			content.classList.add( layoutClass );

			return () => content.classList.remove( layoutClass );
		}
	}, [] );

	return (
		<Layout className="issue-license" title={ translate( 'Issue a new License' ) } wide>
			<LayoutTop>
				<div className="issue-license__step-progress">
					<AssignLicenseStepProgress currentStep="issueLicense" selectedSite={ selectedSite } />
					<TotalCost />
				</div>

				<LayoutHeader>
					<CardHeading size={ 36 }>{ translate( 'Issue a new License' ) }</CardHeading>
				</LayoutHeader>
			</LayoutTop>

			<LayoutBody>
				<IssueMultipleLicensesForm
					selectedSite={ selectedSite }
					suggestedProduct={ suggestedProduct }
				/>
			</LayoutBody>
		</Layout>
	);
}
