import { useTranslate } from 'i18n-calypso';
import { ReactElement, useEffect } from 'react';
import CardHeading from 'calypso/components/card-heading';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import AssignLicenseForm from 'calypso/jetpack-cloud/sections/partner-portal/assign-license-form';
import SidebarNavigation from 'calypso/jetpack-cloud/sections/partner-portal/sidebar-navigation';

export default function AssignLicense( { sites } ): ReactElement {
	const translate = useTranslate();

	useEffect( () => {
		const layoutClass = 'layout__content--partner-portal-assign-license';
		const content = document.getElementById( 'content' );

		if ( content ) {
			content.classList.add( layoutClass );

			return () => content.classList.remove( layoutClass );
		}
	}, [] );

	return (
		<Main wideLayout className="assign-license">
			<DocumentHead title={ translate( 'Assign your new License' ) } />
			<SidebarNavigation />
			<CardHeading size={ 36 }>{ translate( 'Assign your new License' ) }</CardHeading>

			<AssignLicenseForm sites={ sites } />
		</Main>
	);
}
