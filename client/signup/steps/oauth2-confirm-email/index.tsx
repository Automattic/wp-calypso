import { Button } from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useSelector, useDispatch } from 'react-redux';
import Gravatar from 'calypso/components/gravatar';
import wpcom from 'calypso/lib/wp';
import StepWrapper from 'calypso/signup/step-wrapper';
import { fetchCurrentUser } from 'calypso/state/current-user/actions';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';

import './style.scss';

// Current only used in Woo Signup Flow
function Oauth2ConfirmEmail( {
	flowName,
	stepName,
	positionInFlow,
}: {
	flowName: string;
	stepName: string;
	positionInFlow: number;
} ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const currentUser = useSelector( getCurrentUser );
	const [ emailResendCount, setEmailResendCount ] = useState( 0 );
	const EMAIL_RESEND_MAX = 3;

	useEffect( () => {
		dispatch( fetchCurrentUser() as any );
	}, [ dispatch ] );

	const handleResendEmailClick = ( event: React.MouseEvent< HTMLAnchorElement > ) => {
		event.preventDefault();

		if ( emailResendCount >= EMAIL_RESEND_MAX ) {
			return;
		}

		wpcom.req
			.post( '/me/send-verification-email', {
				from: 'woocommerce-signup',
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

	const getHeaderText = () => {
		return (
			<div className={ classNames( 'signup-form__woo-wrapper' ) }>
				<h3>{ translate( 'One last step!' ) }</h3>
			</div>
		);
	};

	const getSubHeaderText = () => {
		return translate(
			"We'll make it quick – promise. Please verify your email address via the{{br}}{{/br}}confirmation email we've sent to you. Don't see an email? It could be hiding in your{{br}}{{/br}}spam folder!",
			{
				components: {
					br: <br />,
				},
			}
		);
	};

	const renderStepContent = () => {
		const userName = currentUser?.display_name || currentUser?.username;

		return (
			<div className="wpcc-confirm-email">
				<div className="confirm-email__user">
					<Gravatar
						user={ currentUser }
						className="confirm-email-user__gravatar"
						imgSize={ 400 }
						size={ 110 }
					/>
					<div>
						<div className="confirm-email-user__username">
							{ translate( 'Signing in as %(username)s', {
								args: { username: userName || '' },
							} ) }
						</div>
						<div className="confirm-email-user__email">{ currentUser?.email }</div>
					</div>
				</div>

				{ emailResendCount < EMAIL_RESEND_MAX && (
					<p className="confirm-email__resend-email">
						{ translate( "Didn't receive an email? {{link}}Resend email{{/link}}", {
							components: {
								link: <Button variant="link" href="" onClick={ handleResendEmailClick } />,
							},
						} ) }
					</p>
				) }
			</div>
		);
	};

	return (
		<StepWrapper
			flowName={ flowName }
			stepName={ stepName }
			headerText={ getHeaderText() }
			subHeaderText={ getSubHeaderText() }
			positionInFlow={ positionInFlow }
			fallbackHeaderText={ getHeaderText() }
			fallbackSubHeaderText={ getSubHeaderText() }
			stepContent={ renderStepContent() }
			customizedActionButtons={ null }
			isSticky={ false }
		/>
	);
}

export default Oauth2ConfirmEmail;
