import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import QRCodeAppLogin from 'calypso/blocks/qr-code-app-login';
import DocumentHead from 'calypso/components/data/document-head';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';

import './style.scss';

export default function QRCodeAppLoginPage() {
	const translate = useTranslate();
	const title = translate( 'Sign in to mobile app' );

	return (
		<Main wideLayout className="qr-code-app-login-page">
			<PageViewTracker path="/me/security/qr-login" title="Me > QR Code App Login" />
			<DocumentHead title={ title } />
			<NavigationHeader navigationItems={ [] } title={ translate( 'Security' ) } />
			<HeaderCake backText={ translate( 'Back' ) } backHref="/me/security">
				{ title }
			</HeaderCake>
			<Card className="qr-code-app-login-page__card">
				<QRCodeAppLogin />
			</Card>
		</Main>
	);
}
