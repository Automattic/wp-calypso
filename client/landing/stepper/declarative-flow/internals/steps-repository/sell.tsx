import { StepContainer } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from '../types';

/**
 * The sell step
 */
const SellStep: Step = function SellStep( { navigation } ) {
	const translate = useTranslate();
	const { goBack } = navigation;
	const headerText = translate( 'Seller step' );

	return (
		<StepContainer
			stepName="sell"
			hideSkip
			goBack={ goBack }
			isHorizontalLayout
			formattedHeader={
				<FormattedHeader id="seller-step-header" headerText={ headerText } align="left" />
			}
			stepContent={ <div>Sell step content</div> }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default SellStep;
