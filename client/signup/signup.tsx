import UserStepComponent from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/__user';

export const SignupPage = () => {
	return (
		<div className="step-route onboarding user">
			<UserStepComponent
				navigation={ {
					submit() {
						// eslint-disable-next-line no-console
						console.log( 'Congratulations, you are now a user!' );
					},
				} }
				stepName="user"
				flow="onboarding"
			/>
		</div>
	);
};
