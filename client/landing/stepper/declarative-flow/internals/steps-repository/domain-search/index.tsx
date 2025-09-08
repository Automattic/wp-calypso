import {
	DOMAIN_FLOW,
	isDomainFlow,
	isHundredYearDomainFlow,
	isHundredYearPlanFlow,
	Step,
	StepContainer,
} from '@automattic/onboarding';
import { __ } from '@wordpress/i18n';
import { WPCOMDomainSearch } from 'calypso/components/domains/wpcom-domain-search';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getSuggestionsVendor } from 'calypso/lib/domains/suggestions';
import { useQuery } from '../../../../hooks/use-query';
import { shouldUseStepContainerV2 } from '../../../helpers/should-use-step-container-v2';
import type { Step as StepType } from '../../types';

import './style.scss';

const DomainSearchStep: StepType = function DomainSearchStep( { flow } ) {
	const initialQuery = useQuery().get( 'new' ) ?? '';

	const config = {
		vendor: getSuggestionsVendor( {
			isSignup: false,
			isDomainOnly: isDomainFlow( flow ),
			flowName: flow,
		} ),
		priceRules: {
			hidePrice: isHundredYearPlanFlow( flow ),
			oneTimePrice: isHundredYearDomainFlow( flow ),
		},
	};

	if ( shouldUseStepContainerV2( flow ) || flow === DOMAIN_FLOW ) {
		return (
			<Step.CenteredColumnLayout
				topBar={ <Step.TopBar /> }
				columnWidth={ 10 }
				className="step-container-v2--domain-search"
				heading={
					<Step.Heading
						text={ __( 'Claim your space on the web' ) }
						subText={ __( 'Make it yours with a .com, .blog, or one of 350+ domain options.' ) }
					/>
				}
			>
				<WPCOMDomainSearch
					className="step-container-v2-domain-search"
					flowName={ flow }
					config={ config }
					initialQuery={ initialQuery }
				/>
			</Step.CenteredColumnLayout>
		);
	}

	return (
		<StepContainer
			stepName="domain-search"
			flowName={ flow }
			goBack={ () => {} }
			goNext={ () => {} }
			stepContent={
				<WPCOMDomainSearch flowName={ flow } config={ config } initialQuery={ initialQuery } />
			}
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default DomainSearchStep;
