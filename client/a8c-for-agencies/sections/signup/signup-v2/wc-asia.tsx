import MultiStepForm from './components/multi-step-form';
import SignupWrapper from './components/signup-wrapper';

const AgencySignupWCAsia = () => {
	return (
		<SignupWrapper>
			<MultiStepForm
				signupWithMagicLinkFlow
				withPersonalizedBlueprint
				sourceName="WC Asia Signup Flow"
			/>
		</SignupWrapper>
	);
};

export default AgencySignupWCAsia;
