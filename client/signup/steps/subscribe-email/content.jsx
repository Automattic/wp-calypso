import { recordTracksEvent } from '@automattic/calypso-analytics';
import { localize } from 'i18n-calypso';
import SignupForm from 'calypso/blocks/signup-form';
import ReskinnedProcessingScreen from 'calypso/signup/reskinned-processing-screen';

function SubscribeEmailStepContent( props ) {
	const {
		email,
		flowName,
		goToNextStep,
		handleCreateAccountError,
		handleCreateAccountSuccess,
		isPending,
		redirectToAfterLoginUrl,
		redirectToLogout,
		redirectUrl,
		step,
		stepName,
		translate,
	} = props;

	if ( isPending ) {
		return <ReskinnedProcessingScreen flowName={ flowName } hasPaidDomain={ false } />;
	}

	return (
		<>
			<SignupForm
				// recaptchaClientId={ this.state.recaptchaClientId }
				displayUsernameInput={ false }
				email={ email || '' }
				flowName={ flowName }
				goToNextStep={ goToNextStep }
				handleCreateAccountError={ handleCreateAccountError }
				handleCreateAccountSuccess={ handleCreateAccountSuccess }
				disableBlurValidation
				isPasswordless
				isReskinned
				isSocialFirst={ false }
				isSocialSignupEnabled={ false }
				labelText={ translate( 'Your email' ) }
				notYouText={ translate(
					'Not you?{{br/}}Log out and {{link}}subscribe with %(email)s{{/link}}',
					{
						components: {
							br: <br />,
							link: (
								<button
									type="button"
									id="loginAsAnotherUser"
									className="continue-as-user__change-user-link"
									onClick={ () => {
										recordTracksEvent( 'calypso_signup_click_on_change_account' );
										redirectToLogout( window.location.href );
									} }
								/>
							),
						},
						args: { email },
						comment: 'Link to continue login as different user',
					}
				) }
				queryArgs={ { user_email: email, redirect_to: redirectUrl } }
				redirectToAfterLoginUrl={ redirectToAfterLoginUrl }
				shouldDisplayUserExistsError
				step={ step }
				stepName={ stepName }
				submitButtonLabel={ translate( 'Subscribe' ) }
				submitButtonLoadingLabel={ translate( 'Subscribing…' ) }
				suggestedUsername=""
			/>
		</>
	);
}

export default localize( SubscribeEmailStepContent );
