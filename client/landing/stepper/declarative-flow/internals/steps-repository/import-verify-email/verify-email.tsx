import { getPlan, PLAN_BUSINESS } from '@automattic/calypso-products';
import { SiteDetails } from '@automattic/data-stores';
import { NextButton, SubTitle, Title } from '@automattic/onboarding';
import { useState } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { useSendEmailVerification } from 'calypso/landing/stepper/hooks/use-send-email-verification';
import { useDispatch } from 'calypso/state';
import { warningNotice } from 'calypso/state/notices/actions';
import type { UserData } from 'calypso/lib/user/user';

interface Props {
	user: UserData;
	site: SiteDetails;
}
const VerifyEmail = function VerifyEmail( props: Props ) {
	const dispatch = useDispatch();
	const { __ } = useI18n();
	const { user } = props;
	const sendEmail = useSendEmailVerification();

	const planType = PLAN_BUSINESS;
	const plan = getPlan( planType );

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
				{ sprintf(
					// translators: planName could be "Pro" or "Business; email is the email address of current user
					__(
						'To start your %(planName)s plan 7-day trial, verify your email address by clicking the link we sent you to %(email)s.'
					),
					{
						email: user.email,
						planName: plan?.getTitle(),
					}
				) }
			</SubTitle>
			<NextButton isBusy={ buttonState.status === 'processing' } onClick={ onResendEmail }>
				{ buttonState.text }
			</NextButton>
		</div>
	);
};

export default VerifyEmail;
