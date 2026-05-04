import { __ } from '@wordpress/i18n';
import { useEffect } from 'react';
import QRCode, { QRCodePlaceholder } from './qr-code';
import { useCreateToken } from './use-create-token';

import './style.scss';

export default function QRCodeAppLogin() {
	const { mutate: createToken, data: token, isPending, isError } = useCreateToken();

	useEffect( () => {
		createToken();
	}, [ createToken ] );

	return (
		<div className="qr-code-app-login">
			<div className="qr-code-app-login__token">
				{ token ? <QRCode token={ token } /> : <QRCodePlaceholder /> }
			</div>
			<p className="qr-code-app-login__instructions">
				{ __( 'Open the app on your phone and scan this code.' ) }
			</p>
			{ isPending && <p className="qr-code-app-login__status">{ __( 'Generating code…' ) }</p> }
			{ isError && (
				<p className="qr-code-app-login__error">
					{ __( 'Could not generate a sign-in code. Please try again later.' ) }
				</p>
			) }
		</div>
	);
}
