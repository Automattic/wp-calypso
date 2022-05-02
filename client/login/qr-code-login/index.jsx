import { Card, Gridicon } from '@automattic/components';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import QRCode from 'qrcode.react';
import qrCenter from 'calypso/assets/images/qr-login/wp.png';
import GlobalNotices from 'calypso/components/global-notices';
import Main from 'calypso/components/main';
import { login } from 'calypso/lib/paths';

import './style.scss';

function QrCodeLogin( { translate, locale } ) {
	const loginParameters = {
		locale: locale,
	};
	return (
		<Main className={ classNames( 'qr-code-login' ) }>
			<GlobalNotices id="notices" />
			<div className="qr-code-login__form">
				<h1 className="qr-code-login__heading">
					{ translate( 'Use QR code to login via the Mobile App' ) }
				</h1>

				<Card className="qr-code-login__card">
					<QRCode
						value="https://apps.wordpress.com/get/?campaign=login-qr-code#token=&data="
						size={ 352 }
						imageSettings={ {
							src: qrCenter,
							x: null,
							y: null,
							height: 64,
							width: 64,
							excavate: true,
						} }
					/>
					<p>{ translate( "Scan with your phone's camera to login to WordPress.com" ) }</p>
				</Card>
				<div className="qr-code-login__footer">
					<a href={ login( loginParameters ) }>
						<Gridicon icon="arrow-left" size={ 18 } />
						{ translate( 'Enter a password instead' ) }
					</a>
				</div>
			</div>
		</Main>
	);
}

export default localize( QrCodeLogin );
