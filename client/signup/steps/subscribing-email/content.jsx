import { localize } from 'i18n-calypso';
import SignupForm from 'calypso/blocks/signup-form';
import ReskinnedProcessingScreen from 'calypso/signup/reskinned-processing-screen';

function SubscribingEmailStepContent( props ) {
	const { flowName, handleSubmitSignup, isLoading, stepName, step, translate, queryParams } = props;

	const redirectUrl = queryParams?.redirect_to || 'https://wordpress.com';
	const email = queryParams?.email;

	if ( isLoading ) {
		return <ReskinnedProcessingScreen flowName={ flowName } hasPaidDomain={ false } />;
	}

	return (
		<>
			<SignupForm
				step={ step }
				stepName={ stepName }
				flowName={ flowName }
				email={ email || '' }
				redirectToAfterLoginUrl={ redirectUrl }
				displayUsernameInput={ false }
				suggestedUsername=""
				isPasswordless
				queryArgs={ { user_email: email } || {} }
				isSocialSignupEnabled={ false }
				// recaptchaClientId={ this.state.recaptchaClientId }
				isReskinned
				shouldDisplayUserExistsError
				isSocialFirst={ false }
				labelText={ translate( 'Your email' ) }
				submitButtonText={ translate( 'Create an account' ) }
				submitForm={ handleSubmitSignup }
			/>
		</>
	);
}

export default localize( SubscribingEmailStepContent );
