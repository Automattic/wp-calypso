import { useTranslate } from 'i18n-calypso';
import { ReactElement, useEffect } from 'react';
import CardHeading from 'calypso/components/card-heading';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import AttachLicenseForm from 'calypso/jetpack-cloud/sections/partner-portal/attach-license-form';
import SidebarNavigation from 'calypso/jetpack-cloud/sections/partner-portal/sidebar-navigation';

export default function AttachLicense(): ReactElement {
	const translate = useTranslate();

	useEffect( () => {
		const layoutClass = 'layout__content--partner-portal-attach-license';
		const content = document.getElementById( 'content' );

		if ( content ) {
			content.classList.add( layoutClass );

			return () => content.classList.remove( layoutClass );
		}
	}, [] );

	return (
		<Main wideLayout className="attach-license">
			<DocumentHead title={ translate( 'Attach your new License' ) } />
			<SidebarNavigation />
			<CardHeading size={ 36 }>{ translate( 'Attach your new License' ) }</CardHeading>

			<AttachLicenseForm />
		</Main>
	);
}
