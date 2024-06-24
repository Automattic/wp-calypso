import { localize } from 'i18n-calypso';
import SignupForm from 'calypso/blocks/signup-form';
import ReskinnedProcessingScreen from 'calypso/signup/reskinned-processing-screen';

function SubscribingEmailStepContent( props ) {
	const { flowName, handleSubmitSignup, isLoading, submitting, queryParams } = props;

	if ( isLoading ) {
		return <ReskinnedProcessingScreen flowName={ flowName } hasPaidDomain={ false } />;
	}

	return (
		<>
			<SignupForm
				step={ props.step }
				email={ queryParams?.email || '' }
				// TODO: Implement actual redirect url
				redirectToAfterLoginUrl="https://wordpress.com"
				// redirectToAfterLoginUrl={ getRedirectToAfterLoginUrl( this.props ) }
				disabled={ submitting }
				submitting={ submitting }
				displayUsernameInput={ false }
				suggestedUsername=""
				isPasswordless
				queryArgs={ { user_email: queryParams?.email } || {} }
				isSocialSignupEnabled={ false }
				// recaptchaClientId={ this.state.recaptchaClientId }
				isReskinned
				shouldDisplayUserExistsError
				isSocialFirst={ false }
				labelText={ props.isWooPasswordless ? props.translate( 'Your email' ) : null }
				submitButtonText={ props.translate( 'Create an account' ) }
				submitForm={ handleSubmitSignup }
			/>
		</>
	);
}

export default localize( SubscribingEmailStepContent );
