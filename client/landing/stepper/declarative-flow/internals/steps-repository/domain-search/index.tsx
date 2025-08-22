import { Step, StepContainer } from '@automattic/onboarding';
import { WPCOMDomainSearch } from 'calypso/components/domains/wpcom-domain-search';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { shouldUseStepContainerV2 } from '../../../helpers/should-use-step-container-v2';
import type { Step as StepType } from '../../types';

const DomainSearchStep: StepType = function DomainSearchStep( { flow } ) {
	const getContent = () => {
		return <WPCOMDomainSearch />;
	};

	if ( shouldUseStepContainerV2( flow ) ) {
		return (
			<Step.CenteredColumnLayout
				topBar={ <Step.TopBar /> }
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
