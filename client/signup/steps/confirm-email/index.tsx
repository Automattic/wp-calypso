import { Button } from '@wordpress/components';
import { useState, useEffect, useLayoutEffect } from '@wordpress/element';
import debugFactory from 'debug';
import { useTranslate } from 'i18n-calypso';
import { useSelector, useDispatch } from 'react-redux';
import QueryUserPurchases from 'calypso/components/data/query-user-purchases';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import wpcom from 'calypso/lib/wp';
import StepWrapper from 'calypso/signup/step-wrapper';
import { getCurrentUserEmail } from 'calypso/state/current-user/selectors';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { getUserPurchases } from 'calypso/state/purchases/selectors';
import { saveSignupStep } from 'calypso/state/signup/progress/actions';
import {
	ActionContainer,
	ActionText,
	ButtonContainer,
	MessageContainer,
	MessageText,
} from './containers';
import { getPrevLocation } from './utils';

const debug = debugFactory( 'calypso:signup:confirm-email' );

type ConfirmEmailProps = {
	flowName: string;
	stepName: string;
	positionInFlow: string;
	isEmailVerified: boolean;
	submitSignupStep: ( step: { stepName: string } ) => void;
	goToNextStep: () => void;
	selectedSite?: { URL: string };
	queryObject?: {
		siteSlug?: string;
		source?: string;
	};
	path?: string;
	locale?: string;
};

export default function ConfirmEmail( {
	goToNextStep,
	isEmailVerified,
	positionInFlow,
	submitSignupStep,
	...props
}: ConfirmEmailProps ) {
	const { flowName, stepName } = props;
	const translate = useTranslate();
	const dispatch = useDispatch();
	const userEmail = useSelector( getCurrentUserEmail );
	const purchases = useSelector( getUserPurchases );
	debug( 'User email: %s', userEmail );

	const [ emailResendCount, setEmailResendCount ] = useState( 0 );
	const EMAIL_RESEND_MAX = 3;

	useEffect( () => {
		if ( userEmail ) {
			dispatch( saveSignupStep( { stepName } ) );

			debug( 'Email confirmation step loaded for %s', userEmail );
		}
	}, [ userEmail, dispatch, stepName ] );

	useLayoutEffect( () => {
		if ( userEmail && purchases?.length ) {
			goToNextStep();
		}
	}, [ userEmail, purchases, goToNextStep ] );

	const handleResendEmailClick = () => {
		if ( emailResendCount >= EMAIL_RESEND_MAX ) {
			return;
		}

		recordTracksEvent( 'calypso_signup_confirm_email_request_resend' );

		wpcom.req
			.post( {
				path: '/me/send-verification-email',
				body: {
					from: `${ flowName } onboarding flow`,
				},
			} )
			.then( () => {
				setEmailResendCount( emailResendCount + 1 );
				dispatch(
					successNotice( translate( 'Verification email resent. Please check your inbox.' ) )
				);
			} )
			.catch( () => {
				dispatch( errorNotice( translate( 'Unable to resend email. Please try again later.' ) ) );
			} );
	};

	const handleNextStepClick = () => {
		debug( 'Email confirmation step completed for %s', userEmail );
		recordTracksEvent( 'calypso_signup_confirm_email_step_submit' );
		submitSignupStep( { stepName } );

		goToNextStep();
	};

	const renderCheckEmailNotice = () => {
		return (
			<>
				<MessageContainer>
					<MessageText>
						{ translate(
							"We've sent an email with a verification link to {{strong}}%(email)s{{/strong}}. Please follow that link to confirm your email address and continue.",
							{
								args: { email: userEmail },
								components: { strong: <strong /> },
							}
						) }
					</MessageText>
				</MessageContainer>
				{ emailResendCount < EMAIL_RESEND_MAX && (
					<ActionContainer>
						<ActionText>{ translate( 'Are you having issues receiving it?' ) }</ActionText>
						<ButtonContainer>
							<Button onClick={ handleResendEmailClick } isLink={ true }>
								{ translate( 'Resend the verification email' ) }
							</Button>
						</ButtonContainer>
					</ActionContainer>
				) }
			</>
		);
	};

	const renderPostConfirmationNotice = () => {
		return (
			<>
				<MessageContainer>
					<MessageText>
						{ translate(
							'Thanks for confirming your email address. Your account is now active. ' +
								"We're almost finished!"
						) }
					</MessageText>
				</MessageContainer>
				<ButtonContainer>
					<Button isPrimary={ true } onClick={ handleNextStepClick }>
						{ translate( 'Continue' ) }
					</Button>
				</ButtonContainer>
			</>
		);
	};

	const prevLoc = getPrevLocation( { ...props, translate } );

	return (
		userEmail && (
			<>
				<QueryUserPurchases />
				<StepWrapper
					flowName={ flowName }
					stepName={ stepName }
					positionInFlow={ positionInFlow }
					headerText={
						isEmailVerified ? translate( 'Email confirmed' ) : translate( 'Check your email' )
					}
					subHeaderText=""
					backUrl={ prevLoc.url }
					isExternalBackUrl={ prevLoc.isExternal }
					allowBackFirstStep={ !! prevLoc.url }
					backLabelText={ prevLoc.label }
					stepContent={
						isEmailVerified ? renderPostConfirmationNotice() : renderCheckEmailNotice()
					}
				/>
			</>
		)
	);
}
