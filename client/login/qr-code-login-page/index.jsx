import { Card, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import AsyncLoad from 'calypso/components/async-load';
import Main from 'calypso/components/main';
import { login } from 'calypso/lib/paths';

import './style.scss';

function QrCodeLoginPlaceholder() {
	return <Card className="qr-code-login-page__placeholder" />;
}

function QrCodeLoginPage( { locale, redirectTo } ) {
	const translate = useTranslate();
	const isWhiteLogin = true;

	return (
		<Main className="qr-code-login-page">
			<div className="qr-code-login-page__form">
				<h1 className="qr-code-login-page__heading">{ translate( 'Log in via Jetpack app' ) }</h1>
				<AsyncLoad
					require="calypso/blocks/qr-code-login"
					placeholder={ <QrCodeLoginPlaceholder /> }
					size={ 300 }
					locale={ locale }
					redirectToAfterLoginUrl={ redirectTo }
				/>
				<div className="qr-code-login-page__footer">
					<a href={ login( { locale, redirectTo, isWhiteLogin } ) }>
						<Gridicon icon="arrow-left" size={ 18 } />
						{ translate( 'Enter a password instead' ) }
					</a>
				</div>
			</div>
		</Main>
	);
}

export default QrCodeLoginPage;
