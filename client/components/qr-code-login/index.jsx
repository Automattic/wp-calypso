import QRCode from 'qrcode.react';
import qrCenter from 'calypso/assets/images/qr-login/wp.png';

function QRCodeLogin() {
	return (
		<>
			<QRCode
				value="https://apps.wordpress.com/get/?campaign=login-qr-code"
				size={ 352 }
				imageSettings={ {
					src: qrCenter,
					height: 64,
					width: 64,
					excavate: false,
				} }
			/>
			<p>{ "Scan with your phone's camera to login to WordPress.com" }</p>
		</>
	);
}

export default QRCodeLogin;
