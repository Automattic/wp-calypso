import MultiStepForm from './components/multi-step-form';
import SignupWrapper from './components/signup-wrapper';

const AgencySignupWCAsia = () => {
	return (
		<SignupWrapper>
			<MultiStepForm submitAsSurvey withPersonalizedBlueprint />
		</SignupWrapper>
	);
};

export default AgencySignupWCAsia;
