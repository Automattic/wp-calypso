import { addQueryArgs } from '@wordpress/url';
import { QRCodeSVG } from 'qrcode.react';
import wooIcon from 'calypso/assets/images/woocommerce/woo_icon_small.svg';
import type { Token } from './types';

const DEEP_LINK_BASE = 'woocommerce://qr-login';

const IMAGE_SETTINGS = {
	src: wooIcon,
	height: 48,
	width: 48,
	excavate: true,
};

interface Props {
	token: Token;
	size?: number;
}

export default function QRCode( { token, size = 300 }: Props ) {
	const value = addQueryArgs( DEEP_LINK_BASE, {
		token: token.token,
		encrypted: token.encrypted,
	} );
	return <QRCodeSVG value={ value } size={ size } imageSettings={ IMAGE_SETTINGS } level="M" />;
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
