import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import AgencySignupForm from 'calypso/jetpack-cloud/sections/agency-signup/agency-signup-form';
import SidebarNavigation from 'calypso/jetpack-cloud/sections/partner-portal/sidebar-navigation';
import type { ReactElement } from 'react';

export default function AgencySignup(): ReactElement {
	const translate = useTranslate();

	return (
		<Main className="agency-signup">
			<DocumentHead title={ translate( 'Sign up as an Agency' ) } />
			<SidebarNavigation />

			<AgencySignupForm />
		</Main>
	);
}
