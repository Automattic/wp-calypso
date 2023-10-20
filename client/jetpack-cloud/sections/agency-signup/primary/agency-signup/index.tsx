import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import AgencySignupForm from 'calypso/jetpack-cloud/sections/agency-signup/agency-signup-form';
import SidebarNavigation from 'calypso/jetpack-cloud/sections/partner-portal/sidebar-navigation';
import type { AgencySignupProps } from 'calypso/jetpack-cloud/sections/agency-signup/types';

export default function AgencySignup( { referrer }: AgencySignupProps ) {
	const translate = useTranslate();

	return (
		<Main className="agency-signup">
			<DocumentHead title={ translate( 'Sign up as an Agency' ) } />
			<SidebarNavigation />

			<AgencySignupForm referrer={ referrer } />
		</Main>
	);
}
