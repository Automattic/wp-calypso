import { WPCOMDomainSearch } from 'calypso/components/domains/wpcom-domain-search';
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
	const getContent = () => {
		return <WPCOMDomainSearch />;
	};

	return (
		<StepWrapper
			headerText="Domain Search"
			subHeaderText="Domain Search"
			stepContent={ getContent() }
			{ ...props }
		/>
	);
}
