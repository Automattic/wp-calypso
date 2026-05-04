import { Button } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useEffect, useState } from 'react';
import QRCode, { QRCodePlaceholder } from './qr-code';
import TimerBar from './timer-bar';
import { useApprove } from './use-approve';
import { useCountdown } from './use-countdown';
import { useCreateToken } from './use-create-token';
import { useDocumentVisible } from './use-document-visible';
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

	const isVisible = useDocumentVisible();
	const { data: statusData, isError: isStatusError } = useStatus( token?.token, isVisible );
	const countdown = useCountdown( token?.expires );

	const [ wrongNumber, setWrongNumber ] = useState( false );
	const { mutate: approve, isPending: isApproving } = useApprove();

	const startOver = () => {
		setWrongNumber( false );
		resetCreateToken();
		createToken();
	};

	const handleApprove = ( chosenNumber: number ) => {
		if ( ! token ) {
			return;
		}
		approve(
			{ token: token.token, chosenNumber },
			{
				onError: ( error ) => {
					if ( error.code === 'wrong_number' ) {
						setWrongNumber( true );
					}
				},
			}
		);
	};

	const status = statusData?.status;
	const isRejected = wrongNumber || status === 'rejected';

	if ( isRejected ) {
		return (
			<div className="qr-code-app-login is-error">
				<p className="qr-code-app-login__error">
					{ __( 'Login was rejected — this sign-in attempt has been cancelled.' ) }
				</p>
				<Button variant="primary" onClick={ startOver }>
					{ __( 'Start over' ) }
				</Button>
			</div>
		);
	}

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

	const isExpired = status === 'expired' || countdown?.hasExpired === true;

	if ( isExpired ) {
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
						<li key={ n }>
							<button
								type="button"
								className="qr-code-app-login__number"
								disabled={ isApproving }
								onClick={ () => handleApprove( n ) }
							>
								{ n }
							</button>
						</li>
					) ) }
				</ul>
				{ countdown && (
					<TimerBar remainingMs={ countdown.remainingMs } totalMs={ countdown.totalMs } />
				) }
			</div>
		);
	}

	return (
		<div className="qr-code-app-login">
			<div className="qr-code-app-login__token">
				{ token ? <QRCode token={ token } /> : <QRCodePlaceholder /> }
			</div>
			<p className="qr-code-app-login__instructions">
				{ __( 'Open the app on your phone and scan this code.' ) }
			</p>
			{ countdown && (
				<TimerBar remainingMs={ countdown.remainingMs } totalMs={ countdown.totalMs } />
			) }
			{ isCreatingToken && (
				<p className="qr-code-app-login__status">{ __( 'Generating code…' ) }</p>
			) }
			{ isStatusError && (
				<p className="qr-code-app-login__error">{ __( 'Lost connection — retrying…' ) }</p>
			) }
		</div>
	);
}
