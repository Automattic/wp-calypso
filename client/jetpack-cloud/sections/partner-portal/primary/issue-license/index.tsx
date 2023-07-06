import { isEnabled } from '@automattic/calypso-config';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import CardHeading from 'calypso/components/card-heading';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import AssignLicenseStepProgress from 'calypso/jetpack-cloud/sections/partner-portal/assign-license-step-progress';
import IssueMultipleLicensesForm from 'calypso/jetpack-cloud/sections/partner-portal/issue-multiple-licenses-form';
import TotalCost from 'calypso/jetpack-cloud/sections/partner-portal/primary/total-cost';
import SidebarNavigation from 'calypso/jetpack-cloud/sections/partner-portal/sidebar-navigation';
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
		<Main fullWidthLayout className="issue-license">
			<DocumentHead title={ translate( 'Issue a new License' ) } />
			<SidebarNavigation />
			<div className="issue-license__step-progress">
				<AssignLicenseStepProgress currentStep="issueLicense" selectedSite={ selectedSite } />
				{ isEnabled( 'jetpack/partner-portal-issue-multiple-licenses' ) && <TotalCost /> }
			</div>
			<CardHeading size={ 36 }>{ translate( 'Issue a new License' ) }</CardHeading>

			<IssueMultipleLicensesForm
				selectedSite={ selectedSite }
				suggestedProduct={ suggestedProduct }
			/>
		</Main>
	);
}
