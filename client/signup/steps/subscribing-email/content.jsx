import { localize } from 'i18n-calypso';
import SignupForm from 'calypso/blocks/signup-form';
import ReskinnedProcessingScreen from 'calypso/signup/reskinned-processing-screen';

function SubscribingEmailStepContent( props ) {
	const { flowName, isAttemptingSubscription, queryParams } = props;

	if ( isAttemptingSubscription ) {
		return (
			<ReskinnedProcessingScreen
				flowName={ flowName }
				hasPaidDomain={ false }
				// isDestinationSetupSiteFlow={ destination.startsWith( '/setup' ) }
			/>
		);
	}

	return (
		<>
			<SignupForm
				step={ props.step }
				email={ queryParams?.email || '' }
				// redirectToAfterLoginUrl={ getRedirectToAfterLoginUrl( this.props ) }
				// disabled={ this.userCreationStarted() }
				// submitting={ this.userCreationStarted() }
				// save={ this.save }
				// submitForm={ this.submitForm }
				// submitButtonText={ this.submitButtonText() }
				// suggestedUsername={ this.props.suggestedUsername }
				// handleSocialResponse={ this.handleSocialResponse }
				isPasswordless
				queryArgs={ props.initialContext?.query || {} }
				isSocialSignupEnabled={ false }
				// socialService={ socialService }
				// socialServiceResponse={ socialServiceResponse }
				// recaptchaClientId={ this.state.recaptchaClientId }
				horizontal
				isReskinned
				shouldDisplayUserExistsError
				isSocialFirst={ false }
				labelText={ props.isWooPasswordless ? props.translate( 'Your email' ) : null }
			/>
		</>
	);
}

export default localize( SubscribingEmailStepContent );
