import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import SidebarNavigation from 'calypso/jetpack-cloud/sections/partner-portal/sidebar-navigation';
import PartnerPortalSignupForm from 'calypso/jetpack-cloud/sections/partner-program-signup/partner-program-signup-form';

export default function PartnerProgramSignup() {
	const translate = useTranslate();

	return (
		<Main className="partner-portal-signup">
			<DocumentHead title={ translate( 'Sign up for the Jetpack Agency & Pro Partner program' ) } />
			<SidebarNavigation />

			<PartnerPortalSignupForm />
		</Main>
	);
}
