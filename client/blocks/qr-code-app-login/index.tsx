import { Button } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useEffect } from 'react';
import QRCode, { QRCodePlaceholder } from './qr-code';
import { useCreateToken } from './use-create-token';
import { useStatus } from './use-status';

import './style.scss';

export default function QRCodeAppLogin() {
	const {
		mutate: createToken,
		data: token,
		isPending: isCreatingToken,
		isError: isTokenError,
		reset: resetCreateToken,
	} = useCreateToken();

	useEffect( () => {
		createToken();
	}, [ createToken ] );

	const { data: statusData, isError: isStatusError } = useStatus( token?.token );

	const startOver = () => {
		resetCreateToken();
		createToken();
	};

	if ( isTokenError ) {
		return (
			<div className="qr-code-app-login is-error">
				<p className="qr-code-app-login__error">
					{ __( 'Could not generate a sign-in code. Please try again later.' ) }
				</p>
				<Button variant="secondary" onClick={ startOver }>
					{ __( 'Start over' ) }
				</Button>
			</div>
		);
	}

	const status = statusData?.status;

	if ( status === 'expired' ) {
		return (
			<div className="qr-code-app-login is-error">
				<p className="qr-code-app-login__error">{ __( 'This sign-in attempt has expired.' ) }</p>
				<Button variant="primary" onClick={ startOver }>
					{ __( 'Start over' ) }
				</Button>
			</div>
		);
	}

	if ( status === 'consumed' ) {
		return (
			<div className="qr-code-app-login">
				<p className="qr-code-app-login__status">{ __( 'Sign-in complete.' ) }</p>
			</div>
		);
	}

	if ( status === 'approved' ) {
		return (
			<div className="qr-code-app-login">
				<p className="qr-code-app-login__status">
					{ __( 'Approved — waiting for the app to finish signing in…' ) }
				</p>
			</div>
		);
	}

	if ( status === 'scanned' && statusData ) {
		const deviceLabel = sprintf(
			/* translators: %s: device name reported by the mobile app, e.g. "Pixel 7". */
			__( 'Confirm sign-in on %s' ),
			statusData.device
		);
		return (
			<div className="qr-code-app-login">
				<p className="qr-code-app-login__status">{ deviceLabel }</p>
				<p className="qr-code-app-login__instructions">
					{ __( 'Tap the number shown on your phone.' ) }
				</p>
				<ul className="qr-code-app-login__numbers">
					{ statusData.numbers.map( ( n ) => (
						<li key={ n } className="qr-code-app-login__number">
							{ n }
						</li>
					) ) }
				</ul>
			</div>
		);
	}

	// Default: pending — show QR code.
	return (
		<div className="qr-code-app-login">
			<div className="qr-code-app-login__token">
				{ token ? <QRCode token={ token } /> : <QRCodePlaceholder /> }
			</div>
			<p className="qr-code-app-login__instructions">
				{ __( 'Open the app on your phone and scan this code.' ) }
			</p>
			{ isCreatingToken && (
				<p className="qr-code-app-login__status">{ __( 'Generating code…' ) }</p>
			) }
			{ isStatusError && (
				<p className="qr-code-app-login__error">{ __( 'Lost connection — retrying…' ) }</p>
			) }
		</div>
	);
}
