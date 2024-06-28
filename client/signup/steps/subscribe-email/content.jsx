import { localize } from 'i18n-calypso';
import SignupForm from 'calypso/blocks/signup-form';
import ReskinnedProcessingScreen from 'calypso/signup/reskinned-processing-screen';

function SubscribeEmailStepContent( props ) {
	const {
		flowName,
		goToNextStep,
		handleSubmitSignup,
		isPending,
		queryParams,
		redirectUrl,
		step,
		stepName,
		translate,
	} = props;

	const user_email = queryParams?.user_email;

	if ( isPending ) {
		return <ReskinnedProcessingScreen flowName={ flowName } hasPaidDomain={ false } />;
	}

	return (
		<>
			<SignupForm
				displayUsernameInput={ false }
				email={ user_email || '' }
				flowName={ flowName }
				goToNextStep={ goToNextStep }
				handleCreateAccountError={ () => {} }
				isPasswordless
				isReskinned
				isSocialFirst={ false }
				isSocialSignupEnabled={ false }
				labelText={ translate( 'Your email' ) }
				queryArgs={ { user_email, redirect_to: redirectUrl } }
				// recaptchaClientId={ this.state.recaptchaClientId }
				redirectToAfterLoginUrl={ redirectUrl }
				shouldDisplayUserExistsError
				step={ step }
				stepName={ stepName }
				submitButtonText={ translate( 'Create an account' ) }
				submitForm={ handleSubmitSignup }
				suggestedUsername=""
			/>
		</>
	);
}

export default localize( SubscribeEmailStepContent );
