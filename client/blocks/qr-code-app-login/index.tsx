import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button, Notice } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useRef, useState } from 'react';
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
	const [ forcedExpired, setForcedExpired ] = useState( false );
	const [ approveError, setApproveError ] = useState< string | null >( null );
	const { mutate: approve, isPending: isApproving } = useApprove();

	const scannedHeadingRef = useRef< HTMLParagraphElement | null >( null );
	useEffect( () => {
		if ( statusData?.status === 'scanned' ) {
			scannedHeadingRef.current?.focus();
		}
	}, [ statusData?.status ] );

	const firedEventsRef = useRef< Set< string > >( new Set() );
	const recordOnce = useCallback( ( name: string ) => {
		if ( firedEventsRef.current.has( name ) ) {
			return;
		}
		firedEventsRef.current.add( name );
		recordTracksEvent( name );
	}, [] );

	useEffect( () => {
		recordTracksEvent( 'calypso_qr_app_login_page_view' );
	}, [] );

	useEffect( () => {
		if ( token ) {
			recordOnce( 'calypso_qr_app_login_token_created' );
		}
	}, [ token, recordOnce ] );

	useEffect( () => {
		if ( isTokenError ) {
			recordOnce( 'calypso_qr_app_login_token_failed' );
		}
	}, [ isTokenError, recordOnce ] );

	const pollStatus = statusData?.status;
	useEffect( () => {
		if ( pollStatus ) {
			recordOnce( `calypso_qr_app_login_${ pollStatus }` );
		}
	}, [ pollStatus, recordOnce ] );

	const localExpired = forcedExpired || countdown?.hasExpired === true;
	const reachedTerminal = pollStatus === 'consumed' || pollStatus === 'approved';
	useEffect( () => {
		if ( localExpired && ! reachedTerminal ) {
			recordOnce( 'calypso_qr_app_login_expired' );
		}
	}, [ localExpired, reachedTerminal, recordOnce ] );

	const handleGenerate = () => {
		recordTracksEvent( 'calypso_qr_app_login_generate_clicked' );
		setHasStarted( true );
		createToken();
	};

	const startOver = () => {
		recordTracksEvent( 'calypso_qr_app_login_start_over' );
		setWrongNumber( false );
		setForcedExpired( false );
		setApproveError( null );
		resetCreateToken();
		setHasStarted( false );
		firedEventsRef.current = new Set();
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
		recordTracksEvent( 'calypso_qr_app_login_approve_clicked' );
		setApproveError( null );
		approve(
			{ token: token.token, chosenNumber },
			{
				onError: ( error ) => {
					if ( error.code === 'wrong_number' ) {
						recordTracksEvent( 'calypso_qr_app_login_wrong_number' );
						setWrongNumber( true );
						return;
					}
					if ( error.code === 'token_expired' || error.code === 'expired' ) {
						setForcedExpired( true );
						return;
					}
					recordTracksEvent( 'calypso_qr_app_login_approve_error', {
						error_code: error.code ?? 'unknown',
					} );
					setApproveError( translate( 'Could not confirm sign-in. Please try again.' ) as string );
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

	if ( status === 'consumed' ) {
		return (
			<div className="qr-code-app-login">
				<p className="qr-code-app-login__status" role="status" aria-live="polite">
					{ translate( 'Sign-in complete.' ) }
				</p>
			</div>
		);
	}

	const connectionLost = isStatusError && (
		<p className="qr-code-app-login__error">{ translate( 'Lost connection — retrying…' ) }</p>
	);

	if ( status === 'approved' ) {
		return (
			<div className="qr-code-app-login">
				<p className="qr-code-app-login__status" role="status" aria-live="polite">
					{ translate( 'Approved — waiting for the app to finish signing in…' ) }
				</p>
				{ connectionLost }
			</div>
		);
	}

	const isExpired = forcedExpired || status === 'expired' || countdown?.hasExpired === true;

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

	if ( status === 'scanned' && statusData ) {
		const deviceLabel = translate( 'Confirm sign-in on %(device)s', {
			args: { device: statusData.device },
			comment: 'device name reported by the mobile app, e.g. "Pixel 7"',
		} );
		return (
			<div className="qr-code-app-login">
				<p
					className="qr-code-app-login__status"
					role="status"
					aria-live="polite"
					tabIndex={ -1 }
					ref={ scannedHeadingRef }
				>
					{ deviceLabel }
				</p>
				<p className="qr-code-app-login__instructions">
					{ translate( 'Tap the number shown on your phone.' ) }
				</p>
				{ approveError && (
					<Notice status="error" isDismissible={ false }>
						{ approveError }
					</Notice>
				) }
				<ul className="qr-code-app-login__numbers">
					{ statusData.numbers.map( ( n ) => (
						<li key={ n }>
							<Button
								className="qr-code-app-login__number"
								variant="secondary"
								disabled={ isApproving }
								onClick={ () => handleApprove( n ) }
								aria-label={
									translate( 'Confirm sign-in by tapping %(number)s', {
										args: { number: String( n ) },
									} ) as string
								}
							>
								{ n }
							</Button>
						</li>
					) ) }
				</ul>
				{ connectionLost }
			</div>
		);
	}

	const steps = [
		translate( 'Open the WooCommerce app on your phone.' ),
		translate( 'Start the login flow.' ),
		translate( 'Tap {{strong}}Scan QR code{{/strong}}.', {
			components: { strong: <strong /> },
		} ),
		translate( 'Point your phone at this screen to scan the code.' ),
	];

	return (
		<div className="qr-code-app-login is-pending">
			<div className="qr-code-app-login__token">
				{ token ? <QRCode token={ token } /> : <QRCodePlaceholder /> }
			</div>
			<div className="qr-code-app-login__instructions">
				<ol className="qr-code-app-login__steps">
					{ steps.map( ( step, index ) => (
						<li key={ index } className="qr-code-app-login__step">
							{ step }
						</li>
					) ) }
				</ol>
				{ countdown && (
					<TimerBar remainingMs={ countdown.remainingMs } totalMs={ countdown.totalMs } />
				) }
				{ isCreatingToken && (
					<p className="qr-code-app-login__status">{ translate( 'Generating code…' ) }</p>
				) }
				{ connectionLost }
			</div>
		</div>
	);
}
