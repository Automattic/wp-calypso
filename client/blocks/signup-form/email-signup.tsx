import { Button } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import PasswordlessSignupForm from '../signup-form/passwordless';

interface EmailSignupProps {
	step: string;
	stepName: string;
	flowName: string;
	goToNextStep: () => void;
	logInUrl: string;
	queryArgs: object;
	handleBack: () => void;
	isGravatarOAuth2Client: boolean;
}

const EmailSignup = ( {
	step,
	stepName,
	flowName,
	goToNextStep,
	logInUrl,
	queryArgs,
	handleBack,
	isGravatarOAuth2Client,
}: EmailSignupProps ) => {
	const { __ } = useI18n();
	const gravatarProps = isGravatarOAuth2Client
		? {
				inputPlaceholder: __( 'Enter your email address' ),
				submitButtonLoadingLabel: __( 'Continue' ),
		  }
		: {};

	return (
		<div className="signup-form-social-first-email">
			<PasswordlessSignupForm
				step={ step }
				stepName={ stepName }
				flowName={ flowName }
				goToNextStep={ goToNextStep }
				logInUrl={ logInUrl }
				queryArgs={ queryArgs }
				renderTerms={ () => {} }
				labelText={ __( 'Your email' ) }
				submitButtonLabel={ __( 'Continue' ) }
				{ ...gravatarProps }
			/>
			<Button onClick={ handleBack } className="back-button" variant="link">
				<span>{ __( 'Back' ) }</span>
			</Button>
		</div>
	);
};

export default EmailSignup;
