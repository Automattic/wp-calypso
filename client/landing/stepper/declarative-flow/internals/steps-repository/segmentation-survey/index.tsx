import { useEffect } from 'react';
import Main from 'calypso/components/main';
import SegmentationSurvey from 'calypso/components/segmentation-survey';
import useSegmentationSurveyTracksEvents from 'calypso/components/segmentation-survey/hooks/use-segmentation-survey-tracks-events';
import { useCachedAnswers } from 'calypso/data/segmentaton-survey';
import type { ProvidedDependencies, Step } from '../../types';
import './style.scss';

const SURVEY_KEY = 'entrepreneur-trial';
const WHAT_WOULD_YOU_LIKE_TO_DO_QUESTION_KEY = 'what-would-you-like-to-do';
const MIGRATE_MY_STORE_ANSWER_KEY = 'migrate-my-store';

type NavigationDecision = {
	proceedWithNavigation: boolean;
	providedDependencies: ProvidedDependencies;
};

const shouldNavigate = (
	questionKey: string,
	answerKeys: string[],
	isLastQuestion?: boolean
): NavigationDecision => {
	const isMigrationFlow =
		questionKey === WHAT_WOULD_YOU_LIKE_TO_DO_QUESTION_KEY &&
		answerKeys.includes( MIGRATE_MY_STORE_ANSWER_KEY );

	return {
		proceedWithNavigation: isLastQuestion || isMigrationFlow,
		providedDependencies: { isMigrationFlow },
	};
};

const SegmentationSurveyStep: Step = ( { navigation } ) => {
	const { recordStartEvent, recordCompleteEvent } = useSegmentationSurveyTracksEvents( SURVEY_KEY );
	const { clearAnswers } = useCachedAnswers( SURVEY_KEY );

	// Record Tracks start event on component mount
	useEffect( () => {
		recordStartEvent();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	const handleNext = ( questionKey: string, answerKeys: string[], isLastQuestion?: boolean ) => {
		const { proceedWithNavigation, providedDependencies } = shouldNavigate(
			questionKey,
			answerKeys,
			isLastQuestion
		);

		if ( proceedWithNavigation ) {
			// For custom navigation, we need to clear the answers before the last question
			if ( ! isLastQuestion ) {
				clearAnswers();
			}

			recordCompleteEvent();
			navigation.submit?.( providedDependencies );
		}
	};

	return (
		<Main className="segmentation-survey-step">
			<SegmentationSurvey
				surveyKey={ SURVEY_KEY }
				onBack={ navigation.goBack }
				onNext={ handleNext }
			/>
		</Main>
	);
};

export default SegmentationSurveyStep;
