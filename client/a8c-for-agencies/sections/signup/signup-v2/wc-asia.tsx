import MultiStepForm from './components/multi-step-form';
import SignupWrapper from './components/signup-wrapper';

const AgencySignupWCAsia = () => {
	return (
		<SignupWrapper>
			<MultiStepForm signupWithMagicLinkFlow withPersonalizedBlueprint />
		</SignupWrapper>
	);
};

export default AgencySignupWCAsia;
