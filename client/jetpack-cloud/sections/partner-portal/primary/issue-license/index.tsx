import { isEnabled } from '@automattic/calypso-config';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import CardHeading from 'calypso/components/card-heading';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import AssignLicenseStepProgress from 'calypso/jetpack-cloud/sections/partner-portal/assign-license-step-progress';
import IssueLicenseForm from 'calypso/jetpack-cloud/sections/partner-portal/issue-license-form';
import IssueMultipleLicensesForm from 'calypso/jetpack-cloud/sections/partner-portal/issue-multiple-licenses-form';
import SidebarNavigation from 'calypso/jetpack-cloud/sections/partner-portal/sidebar-navigation';
import { AssignLicenceProps } from '../../types';

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
		<Main wideLayout className="issue-license">
			<DocumentHead title={ translate( 'Issue a new License' ) } />
			<SidebarNavigation />
			<AssignLicenseStepProgress currentStep="issueLicense" />
			<CardHeading size={ 36 }>{ translate( 'Issue a new License' ) }</CardHeading>

			{ isEnabled( 'jetpack/partner-portal-issue-multiple-licenses' ) ? (
				<IssueMultipleLicensesForm selectedSite={ selectedSite } selectedProductSlugs={ [] } />
			) : (
				<IssueLicenseForm selectedSite={ selectedSite } suggestedProduct={ suggestedProduct } />
			) }
		</Main>
	);
}
