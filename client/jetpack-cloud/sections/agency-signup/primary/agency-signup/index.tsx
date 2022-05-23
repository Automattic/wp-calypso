import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import CardHeading from 'calypso/components/card-heading';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import SidebarNavigation from 'calypso/jetpack-cloud/sections/partner-portal/sidebar-navigation';
import type { ReactElement } from 'react';

export default function AgencySignup(): ReactElement {
	const translate = useTranslate();

	return (
		<Main wideLayout className="agency-signup">
			<DocumentHead title={ translate( 'Sign up as an Agency' ) } />
			<SidebarNavigation />

			<Card>
				<CardHeading>{ translate( 'Sign up as an Agency' ) }</CardHeading>
			</Card>
		</Main>
	);
}
