import { Button, Notice } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import QRCode, { QRCodePlaceholder } from './qr-code';
import TimerBar from './timer-bar';
import { useApprove } from './use-approve';
import { useCountdown } from './use-countdown';
import { useCreateToken } from './use-create-token';
import { useDocumentVisible } from './use-document-visible';
import { useStatus } from './use-status';

import './style.scss';

export default function QRCodeAppLogin() {
	const translate = useTranslate();
	const [ hasStarted, setHasStarted ] = useState( false );
	const {
		mutate: createToken,
		data: token,
		isPending: isCreatingToken,
		isError: isTokenError,
		reset: resetCreateToken,
	} = useCreateToken();

	const isVisible = useDocumentVisible();
	const { data: statusData, isError: isStatusError } = useStatus( token?.token, isVisible );
	const countdown = useCountdown( token?.expires );

	const [ wrongNumber, setWrongNumber ] = useState( false );
	const { mutate: approve, isPending: isApproving } = useApprove();

	const handleGenerate = () => {
		setHasStarted( true );
		createToken();
	};

	const startOver = () => {
		setWrongNumber( false );
		resetCreateToken();
		setHasStarted( false );
	};

	if ( ! hasStarted ) {
		return (
			<div className="qr-code-app-login is-intent">
				<p className="qr-code-app-login__instructions">
					{ translate(
						'Generate a one-time code to sign in to the WooCommerce app on your phone. The code expires in 2 minutes.'
					) }
				</p>
				<Button variant="primary" onClick={ handleGenerate }>
					{ translate( 'Generate code' ) }
				</Button>
			</div>
		);
	}

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
				<Notice status="error" isDismissible={ false }>
					{ translate( 'Login was rejected — this sign-in attempt has been cancelled.' ) }
				</Notice>
				<Button variant="primary" onClick={ startOver }>
					{ translate( 'Start over' ) }
				</Button>
			</div>
		);
	}

	if ( isTokenError ) {
		return (
			<div className="qr-code-app-login is-error">
				<Notice status="error" isDismissible={ false }>
					{ translate( 'Could not generate a sign-in code. Please try again later.' ) }
				</Notice>
				<Button variant="primary" onClick={ startOver }>
					{ translate( 'Start over' ) }
				</Button>
			</div>
		);
	}

	const isExpired = status === 'expired' || countdown?.hasExpired === true;

	if ( isExpired ) {
		return (
			<div className="qr-code-app-login is-error">
				<Notice status="warning" isDismissible={ false }>
					{ translate( 'This sign-in attempt has expired.' ) }
				</Notice>
				<Button variant="primary" onClick={ startOver }>
					{ translate( 'Start over' ) }
				</Button>
			</div>
		);
	}

	if ( status === 'consumed' ) {
		return (
			<div className="qr-code-app-login">
				<p className="qr-code-app-login__status">{ translate( 'Sign-in complete.' ) }</p>
			</div>
		);
	}

	if ( status === 'approved' ) {
		return (
			<div className="qr-code-app-login">
				<p className="qr-code-app-login__status">
					{ translate( 'Approved — waiting for the app to finish signing in…' ) }
				</p>
			</div>
		);
	}

	if ( status === 'scanned' && statusData ) {
		const deviceLabel = translate( 'Confirm sign-in on %(device)s', {
			args: { device: statusData.device },
			comment: 'device name reported by the mobile app, e.g. "Pixel 7"',
		} );
		return (
			<div className="qr-code-app-login">
				<p className="qr-code-app-login__status">{ deviceLabel }</p>
				<p className="qr-code-app-login__instructions">
					{ translate( 'Tap the number shown on your phone.' ) }
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
				{ translate( 'Open the app on your phone and scan this code.' ) }
			</p>
			{ countdown && (
				<TimerBar remainingMs={ countdown.remainingMs } totalMs={ countdown.totalMs } />
			) }
			{ isCreatingToken && (
				<p className="qr-code-app-login__status">{ translate( 'Generating code…' ) }</p>
			) }
			{ isStatusError && (
				<p className="qr-code-app-login__error">{ translate( 'Lost connection — retrying…' ) }</p>
			) }
		</div>
	);
}
