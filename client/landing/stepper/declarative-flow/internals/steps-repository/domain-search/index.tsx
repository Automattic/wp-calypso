import { DOMAIN_FLOW, Step, StepContainer } from '@automattic/onboarding';
import { WPCOMDomainSearch } from 'calypso/components/domains/wpcom-domain-search';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { shouldUseStepContainerV2 } from '../../../helpers/should-use-step-container-v2';
import type { Step as StepType } from '../../types';

import './style.scss';

const DomainSearchStep: StepType = function DomainSearchStep( { flow } ) {
	if ( shouldUseStepContainerV2( flow ) || flow === DOMAIN_FLOW ) {
		return (
			<Step.CenteredColumnLayout
				topBar={ <Step.TopBar /> }
				columnWidth={ 10 }
				className="step-container-v2--domain-search"
				heading={ <Step.Heading text="Domain Search" /> }
			>
				<WPCOMDomainSearch className="step-container-v2-domain-search" />
			</Step.CenteredColumnLayout>
		);
	}

	return (
		<StepContainer
			stepName="domain-search"
			flowName={ flow }
			goBack={ () => {} }
			goNext={ () => {} }
			stepContent={ <WPCOMDomainSearch /> }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default DomainSearchStep;
