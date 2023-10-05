import { NextButton, SubTitle, Title } from '@automattic/onboarding';
import { useState } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import { useSendEmailVerification } from 'calypso/landing/stepper/hooks/use-send-email-verification';
import { useDispatch } from 'calypso/state';
import { warningNotice } from 'calypso/state/notices/actions';

const VerifyEmail = function VerifyEmail() {
	const dispatch = useDispatch();
	const { __ } = useI18n();
	const sendEmail = useSendEmailVerification();

	const defaultButtonState = {
		status: 'default',
		text: __( 'Resend verification email' ),
	};
	const [ buttonState, setButtonState ] = useState( defaultButtonState );

	const onResendEmail = async () => {
		setButtonState( { status: 'processing', text: __( 'Sending…' ) } );
		sendEmail()
			.then( () => {
				setButtonState( { status: 'success', text: __( 'Request sent!' ) } );
				setTimeout( () => setButtonState( defaultButtonState ), 3000 );
			} )
			.catch( ( e ) => {
				dispatch( warningNotice( e.message ) );
				setButtonState( defaultButtonState );
			} );
	};

	return (
		<div className="verify-email--container">
			<Title>{ __( 'Verify your email address' ) }</Title>
			<SubTitle>
				{ __(
					'To access hosting features you will need to verify your email address. Head to your inbox and click the link we sent you. This page will refresh automatically'
				) }
			</SubTitle>
			<NextButton isBusy={ buttonState.status === 'processing' } onClick={ onResendEmail }>
				{ buttonState.text }
			</NextButton>

			<div className="hosting-trial-limitation">
				<Title>{ __( 'Limitations' ) }</Title>
				<SubTitle>
					{ __( 'After upgrading to a paid plan the following limitations will be lifted' ) }
				</SubTitle>
				<ul>
					<li>{ __( 'Limited email sending capabilities' ) }</li>
					<li>{ __( '1GB of storage only' ) }</li>
					<li>{ __( 'Your site cannot be launched to the public ' ) }</li>
				</ul>
			</div>
		</div>
	);
};

export default VerifyEmail;
