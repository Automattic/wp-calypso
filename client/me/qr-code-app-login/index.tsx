import { useTranslate } from 'i18n-calypso';
import QRCodeAppLogin from 'calypso/blocks/qr-code-app-login';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';

export default function QRCodeAppLoginPage() {
	const translate = useTranslate();
	const title = translate( 'Sign in to mobile app' );

	return (
		<Main wideLayout className="qr-code-app-login-page">
			<DocumentHead title={ title } />
			<QRCodeAppLogin />
		</Main>
	);
}
