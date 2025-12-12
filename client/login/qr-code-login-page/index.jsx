import { Card } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import AsyncLoad from 'calypso/components/async-load';
import Main from 'calypso/components/main';
import { login } from 'calypso/lib/paths';
import LoginContextProvider from 'calypso/login/login-context';
import OneLoginFooter from 'calypso/login/wp-login/components/one-login-footer';
import OneLoginLayout from 'calypso/login/wp-login/components/one-login-layout';

import './style.scss';

function QrCodeLoginPlaceholder() {
	return <Card className="qr-code-login-page__placeholder" />;
}

function QrCodeLoginPage( { locale, redirectTo, isJetpack = false } ) {
	const translate = useTranslate();

	const mainContent = (
		<Main className={ clsx( 'qr-code-login-page', { 'is-jetpack': isJetpack } ) }>
			<div className="qr-code-login-page__form">
				<AsyncLoad
					require="calypso/blocks/qr-code-login"
					placeholder={ <QrCodeLoginPlaceholder /> }
					size={ 300 }
					locale={ locale }
					redirectToAfterLoginUrl={ redirectTo }
					isJetpack={ isJetpack }
				/>
			</div>
			<OneLoginFooter
				loginLink={
					<a className="one-login__footer-link" href={ login( { locale, redirectTo, isJetpack } ) }>
						{ translate( 'Enter a password instead' ) }
					</a>
				}
			/>
		</Main>
	);

	return (
		<OneLoginLayout isJetpack={ isJetpack } columnWidth={ 8 }>
			{ mainContent }
		</OneLoginLayout>
	);
}

const QrCodeLoginPageWithContext = ( props ) => {
	const translate = useTranslate();
	return (
		<LoginContextProvider
			initialHeading={ translate( 'Log in via Jetpack app' ) }
			initialSubHeading={ translate( 'Open the Jetpack app on your phone to scan this code.' ) }
		>
			<QrCodeLoginPage { ...props } />
		</LoginContextProvider>
	);
};

export default QrCodeLoginPageWithContext;
