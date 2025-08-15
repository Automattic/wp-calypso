import { Step, StepContainer } from '@automattic/onboarding';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { shouldUseStepContainerV2 } from '../../../helpers/should-use-step-container-v2';
import type { Step as StepType } from '../../types';

const DomainSearchStep: StepType = function DomainSearchStep( { flow } ) {
	const getContent = () => {
		return <div>TODO: Implement domain search</div>;
	};

	if ( shouldUseStepContainerV2( flow ) ) {
		return (
			<Step.CenteredColumnLayout
				columnWidth={ 8 }
				heading={ <Step.Heading text="Domain Search" /> }
			>
				{ getContent() }
			</Step.CenteredColumnLayout>
		);
	}

	return (
		<StepContainer
			stepName="domain-search"
			flowName={ flow }
			goBack={ () => {} }
			goNext={ () => {} }
			stepContent={ getContent() }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default DomainSearchStep;
