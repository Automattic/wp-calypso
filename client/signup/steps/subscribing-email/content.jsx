import { addQueryArgs } from '@wordpress/url';
import { localize } from 'i18n-calypso';
import SignupForm from 'calypso/blocks/signup-form';
import ReskinnedProcessingScreen from 'calypso/signup/reskinned-processing-screen';

function SubscribingEmailStepContent( props ) {
	const {
		flowName,
		handleSubmitSignup,
		isPending,
		stepName,
		step,
		translate,
		queryParams,
		goToNextStep,
	} = props;

	const redirect_to = queryParams?.redirect_to
		? addQueryArgs( queryParams.redirect_to, { subscribed: true } )
		: 'https://wordpress.com';
	const email = queryParams?.email;

	if ( isPending ) {
		return <ReskinnedProcessingScreen flowName={ flowName } hasPaidDomain={ false } />;
	}

	return (
		<>
			<SignupForm
				step={ step }
				stepName={ stepName }
				flowName={ flowName }
				email={ email || '' }
				goToNextStep={ goToNextStep }
				displayUsernameInput={ false }
				redirectToAfterLoginUrl={ redirect_to }
				suggestedUsername=""
				isPasswordless
				queryArgs={ { user_email: email, redirect_to } || {} }
				isSocialSignupEnabled={ false }
				// recaptchaClientId={ this.state.recaptchaClientId }
				isReskinned
				shouldDisplayUserExistsError
				isSocialFirst={ false }
				labelText={ translate( 'Your email' ) }
				submitButtonText={ translate( 'Create an account' ) }
				submitForm={ handleSubmitSignup }
				onPasswordlessCreateAccountError={ () => {} }
			/>
		</>
	);
}

export default localize( SubscribingEmailStepContent );
