import { localize } from 'i18n-calypso';
import SignupForm from 'calypso/blocks/signup-form';
import { isExistingAccountError } from 'calypso/lib/signup/is-existing-account-error';
import ReskinnedProcessingScreen from 'calypso/signup/reskinned-processing-screen';

function SubscribeEmailStepContent( props ) {
	const {
		email,
		flowName,
		goToNextStep,
		handleSubmitSignup,
		isPending,
		queryParams,
		redirectUrl,
		step,
		stepName,
		subscribeToMailingList,
		translate,
	} = props;

	if ( isPending ) {
		return <ReskinnedProcessingScreen flowName={ flowName } hasPaidDomain={ false } />;
	}

	return (
		<>
			<SignupForm
				displayUsernameInput={ false }
				email={ email || '' }
				flowName={ flowName }
				goToNextStep={ goToNextStep }
				handleCreateAccountError={ ( error, submittedEmail ) => {
					if ( isExistingAccountError( error.error ) ) {
						subscribeToMailingList( {
							email_address: submittedEmail,
							mailing_list_category: queryParams.mailing_list,
						} );
					}
				} }
				isPasswordless
				isReskinned
				isSocialFirst={ false }
				isSocialSignupEnabled={ false }
				labelText={ translate( 'Your email' ) }
				queryArgs={ { user_email: email, redirect_to: redirectUrl } }
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
