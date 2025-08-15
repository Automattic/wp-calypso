import StepWrapper from 'calypso/signup/step-wrapper';

export type StepProps = {
	stepSectionName: string | null;
	stepName: string;
	flowName: string;
	goToStep: () => void;
	goToNextStep: () => void;
	submitSignupStep: ( step: unknown, dependencies: unknown ) => void;
};

export default function DomainSearchStep( props: StepProps ) {
	return (
		<StepWrapper
			headerText="Domain Search"
			subHeaderText="Domain Search"
			stepContent={ <div>TODO: Implement domain search</div> }
			{ ...props }
		/>
	);
}
