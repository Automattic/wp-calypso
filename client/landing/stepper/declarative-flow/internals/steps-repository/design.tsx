import { StepContainer } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from '../types';

/**
 * The design step
 */
const DesignStep: Step = function DesignStep( { navigation } ) {
	const translate = useTranslate();
	const { goNext, goBack } = navigation;
	const headerText = translate( 'Design step' );

	return (
		<StepContainer
			hideSkip
			goBack={ goBack }
			goNext={ goNext }
			hideNext={ false }
			backLabelText={ translate( 'Previous' ) }
			nextLabelText={ translate( 'Next' ) }
			isHorizontalLayout={ true }
			formattedHeader={
				<FormattedHeader id={ 'domain-step-header' } headerText={ headerText } align={ 'left' } />
			}
			stepContent={ <div>Design step content</div> }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default DesignStep;
