import { Card, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import AsyncLoad from 'calypso/components/async-load';
import Main from 'calypso/components/main';
import { login } from 'calypso/lib/paths';

import './style.scss';

function QrCodeLoginPlaceholder() {
	return <div className="qr-code-login__placeholder"></div>;
}

function QrCodeLoginPage( { locale } ) {
	const translate = useTranslate();

	return (
		<Main className="qr-code-login">
			<div className="qr-code-login__form">
				<h1 className="qr-code-login__heading">{ 'Login via the mobile app' }</h1>
				<Card className="qr-code-login__card">
					<AsyncLoad
						require="calypso/components/qr-code-login"
						placeholder={ <QrCodeLoginPlaceholder /> }
						size={ 352 }
					/>
				</Card>
				<div className="qr-code-login__footer">
					<a href={ login( { locale } ) }>
						<Gridicon icon="arrow-left" size={ 18 } />
						{ translate( 'Enter a password instead' ) }
					</a>
				</div>
			</div>
		</Main>
	);
}

export default QrCodeLoginPage;
