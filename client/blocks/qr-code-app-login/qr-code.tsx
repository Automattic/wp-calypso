import { QRCodeSVG } from 'qrcode.react';
import type { Token } from './types';

interface Props {
	token: Token;
	size?: number;
}

export default function QRCode( { token, size = 300 }: Props ) {
	const value = JSON.stringify( { token: token.token, encrypted: token.encrypted } );
	return <QRCodeSVG value={ value } size={ size } />;
}

export function QRCodePlaceholder() {
	return (
		<div className="qr-code-app-login__placeholder">
			<span className="qr-code-app-login__corner-box" />
			<span className="qr-code-app-login__corner-box" />
			<span className="qr-code-app-login__corner-box" />
		</div>
	);
}
