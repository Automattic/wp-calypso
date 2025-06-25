import { Card } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import AsyncLoad from 'calypso/components/async-load';
import Main from 'calypso/components/main';
import { login } from 'calypso/lib/paths';

import './style.scss';

function QrCodeLoginPlaceholder() {
	return <Card className="qr-code-login-page__placeholder" />;
}

function QrCodeLoginPage( { locale, redirectTo, isJetpack = false } ) {
	const translate = useTranslate();
	const isWhiteLogin = true;

	return (
		<Main className={ clsx( 'qr-code-login-page', { 'is-jetpack': isJetpack } ) }>
			<div className="qr-code-login-page__form">
				{ isJetpack ? (
					<div className="magic-login__gutenboarding-wordpress-logo">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
						>
							<path
								d="M12 0C9.62663 0 7.30655 0.703788 5.33316 2.02236C3.35977 3.34094 1.8217 5.21508 0.913451 7.4078C0.00519938 9.60051 -0.232441 12.0133 0.230582 14.3411C0.693605 16.6689 1.83649 18.807 3.51472 20.4853C5.19295 22.1635 7.33115 23.3064 9.65892 23.7694C11.9867 24.2324 14.3995 23.9948 16.5922 23.0865C18.7849 22.1783 20.6591 20.6402 21.9776 18.6668C23.2962 16.6934 24 14.3734 24 12C24 8.8174 22.7357 5.76515 20.4853 3.51472C18.2348 1.26428 15.1826 0 12 0ZM11.3684 13.9895H5.40632L11.3684 2.35579V13.9895ZM12.5811 21.6189V9.98526H18.5621L12.5811 21.6189Z"
								fill="#069E08"
							/>
						</svg>
					</div>
				) : (
					<div className="magic-login__gutenboarding-wordpress-logo">
						<svg
							aria-hidden="true"
							role="img"
							focusable="false"
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 20 20"
						>
							<path d="M20 10c0-5.51-4.49-10-10-10C4.48 0 0 4.49 0 10c0 5.52 4.48 10 10 10 5.51 0 10-4.48 10-10zM7.78 15.37L4.37 6.22c.55-.02 1.17-.08 1.17-.08.5-.06.44-1.13-.06-1.11 0 0-1.45.11-2.37.11-.18 0-.37 0-.58-.01C4.12 2.69 6.87 1.11 10 1.11c2.33 0 4.45.87 6.05 2.34-.68-.11-1.65.39-1.65 1.58 0 .74.45 1.36.9 2.1.35.61.55 1.36.55 2.46 0 1.49-1.4 5-1.4 5l-3.03-8.37c.54-.02.82-.17.82-.17.5-.05.44-1.25-.06-1.22 0 0-1.44.12-2.38.12-.87 0-2.33-.12-2.33-.12-.5-.03-.56 1.2-.06 1.22l.92.08 1.26 3.41zM17.41 10c.24-.64.74-1.87.43-4.25.7 1.29 1.05 2.71 1.05 4.25 0 3.29-1.73 6.24-4.4 7.78.97-2.59 1.94-5.2 2.92-7.78zM6.1 18.09C3.12 16.65 1.11 13.53 1.11 10c0-1.3.23-2.48.72-3.59C3.25 10.3 4.67 14.2 6.1 18.09zm4.03-6.63l2.58 6.98c-.86.29-1.76.45-2.71.45-.79 0-1.57-.11-2.29-.33.81-2.38 1.62-4.74 2.42-7.1z"></path>
						</svg>
					</div>
				) }
				<AsyncLoad
					require="calypso/blocks/qr-code-login"
					placeholder={ <QrCodeLoginPlaceholder /> }
					size={ 300 }
					locale={ locale }
					redirectToAfterLoginUrl={ redirectTo }
					isJetpack={ isJetpack }
				/>
				<div className="qr-code-login-page__footer">
					<a href={ login( { locale, redirectTo, isWhiteLogin, isJetpack } ) }>
						{ translate( 'Enter a password instead' ) }
					</a>
				</div>
			</div>
		</Main>
	);
}

export default QrCodeLoginPage;
