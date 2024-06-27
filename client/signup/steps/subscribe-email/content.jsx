import { localize } from 'i18n-calypso';
import SignupForm from 'calypso/blocks/signup-form';
import ReskinnedProcessingScreen from 'calypso/signup/reskinned-processing-screen';

function SubscribeEmailStepContent( props ) {
	const {
		email,
		flowName,
		goToNextStep,
		handleCreateAccountError,
		handleSubmitForm,
		isPending,
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
				isPasswordless
				isReskinned
				isSocialFirst={ false }
				isSocialSignupEnabled={ false }
				labelText={ translate( 'Your email' ) }
				queryArgs={ { user_email: email, redirect_to: redirectUrl } }
				redirectToAfterLoginUrl={ redirectUrl }
				shouldDisplayUserExistsError
				step={ step }
				stepName={ stepName }
				submitButtonText={ translate( 'Subscribe email' ) }
				submitButtonLabel={ translate( 'Subscribe email' ) }
				submitForm={ handleSubmitForm }
				suggestedUsername=""
			/>
		</>
	);
}

export default localize( SubscribeEmailStepContent );
