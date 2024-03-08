import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import AgencySignupForm from 'calypso/jetpack-cloud/sections/agency-signup/agency-signup-form';
import SidebarNavigation from 'calypso/jetpack-cloud/sections/partner-portal/sidebar-navigation';

export default function AgencySignup() {
	const translate = useTranslate();

	return (
		<Main className="agency-signup">
			<DocumentHead title={ translate( 'Sign up for Jetpack Manage' ) } />
			<SidebarNavigation />

			<AgencySignupForm />
		</Main>
	);
}
