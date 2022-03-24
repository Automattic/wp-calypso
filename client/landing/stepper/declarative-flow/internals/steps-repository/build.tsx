import { StepContainer } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from '../types';

/**
 * The build step
 */
const BuildStep: Step = function BuildStep( { navigation } ) {
	const translate = useTranslate();
	const { goBack } = navigation;
	const headerText = translate( 'Build step' );

	return (
		<StepContainer
			hideSkip
			goBack={ goBack }
			isHorizontalLayout={ true }
			formattedHeader={
				<FormattedHeader id={ 'build-step-header' } headerText={ headerText } align={ 'left' } />
			}
			stepContent={ <div>Build step content</div> }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default BuildStep;
