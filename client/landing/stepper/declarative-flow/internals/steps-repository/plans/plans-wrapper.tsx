import PlansStep from 'calypso/signup/steps/plans';
interface Props {
	onSubmit: () => void;
}

const PlansWrapper: React.FC< Props > = ( { onSubmit } ) => {
	const propsTest = {
		stepName: 'plans-link-in-bio',
		flowName: 'link-in-bio',
		stepSectionName: undefined,
		signupDependencies: { domainItem: null },
		goToNextStep: onSubmit,
		translate: () => 'string',
	};

	return (
		<div className="stepper-plans">
			<PlansStep { ...propsTest } />
		</div>
	);
};

export default PlansWrapper;
