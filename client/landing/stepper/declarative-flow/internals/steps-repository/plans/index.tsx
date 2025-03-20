import {
	isDomainUpsellFlow,
	isNewHostedSiteCreationFlow,
	isStartWritingFlow,
	StepContainer,
} from '@automattic/onboarding';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import PlansWrapper from './plans-wrapper';
import type { Step } from '../../types';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';

/**
 * @deprecated Use `unified-plans` instead. This step is deprecated and will be removed in the future.
 */
const plans: Step< {
	submits: {
		plan: MinimalRequestCartProduct | null;
		goToCheckout: boolean;
	};
} > = function Plans( { navigation, flow } ) {
	const { goBack, submit } = navigation;

	const handleSubmit = ( plan: MinimalRequestCartProduct | null ) => {
		const providedDependencies = {
			plan,
			goToCheckout: isDomainUpsellFlow( flow ) || isStartWritingFlow( flow ),
		};

		submit?.( providedDependencies );
	};

	const isAllowedToGoBack = isDomainUpsellFlow( flow ) || isNewHostedSiteCreationFlow( flow );

	return (
		<StepContainer
			stepName="plans"
			goBack={ goBack }
			isHorizontalLayout={ false }
			isWideLayout={ false }
			isExtraWideLayout
			hideFormattedHeader
			isLargeSkipLayout={ false }
			hideBack={ ! isAllowedToGoBack }
			stepContent={
				<PlansWrapper
					flowName={ flow }
					onSubmit={ handleSubmit }
					shouldIncludeFAQ={ isNewHostedSiteCreationFlow( flow ) }
				/>
			}
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default plans;
