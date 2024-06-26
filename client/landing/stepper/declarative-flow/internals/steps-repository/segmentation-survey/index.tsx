import { useCallback, useEffect } from 'react';
import Main from 'calypso/components/main';
import SegmentationSurvey from 'calypso/components/segmentation-survey';
import useSegmentationSurveyTracksEvents from 'calypso/components/segmentation-survey/hooks/use-segmentation-survey-tracks-events';
import { useHash } from 'calypso/landing/stepper/hooks/use-hash';
import type { ProvidedDependencies, Step } from '../../types';
import './style.scss';

export const ENTREPRENEUR_TRIAL_SURVEY_KEY = 'entrepreneur-trial';
const WHAT_WOULD_YOU_LIKE_TO_DO_QUESTION_KEY = 'what-would-you-like-to-do';
const MIGRATE_MY_STORE_ANSWER_KEY = 'migrate-my-store';

type NavigationDecision = {
	proceedWithNavigation: boolean;
	providedDependencies: ProvidedDependencies;
};

const checkMigrationAnswer = ( questionKey: string, answerKeys: string[] ): boolean =>
	questionKey === WHAT_WOULD_YOU_LIKE_TO_DO_QUESTION_KEY &&
	answerKeys.includes( MIGRATE_MY_STORE_ANSWER_KEY );

const useShouldNavigate = () => {
	const hash = useHash();

	const shouldNavigate = useCallback(
		( questionKey: string, answerKeys: string[], isLastQuestion?: boolean ): NavigationDecision => {
			const isMigrationFlow = checkMigrationAnswer( questionKey, answerKeys );

			const proceedWithNavigation = isLastQuestion || isMigrationFlow;
			const providedDependencies: ProvidedDependencies = { isMigrationFlow };

			if ( proceedWithNavigation ) {
				const lastQuestionPath = hash;

				if ( lastQuestionPath ) {
					providedDependencies.lastQuestionPath = lastQuestionPath;
				}
			}

			return {
				proceedWithNavigation,
				providedDependencies,
			};
		},
		[ hash ]
	);

	return { shouldNavigate };
};

const SegmentationSurveyStep: Step = ( { navigation } ) => {
	const { recordStartEvent, recordCompleteEvent } = useSegmentationSurveyTracksEvents(
		ENTREPRENEUR_TRIAL_SURVEY_KEY
	);
	const { shouldNavigate } = useShouldNavigate();

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
			recordCompleteEvent();
			navigation.submit?.( providedDependencies );
		}
	};

	return (
		<Main className="segmentation-survey-step">
			<SegmentationSurvey
				surveyKey={ ENTREPRENEUR_TRIAL_SURVEY_KEY }
				onBack={ navigation.goBack }
				onNext={ handleNext }
				headerAlign="left"
				clearAnswersOnLastQuestion={ false }
				skipNextNavigation={ checkMigrationAnswer }
			/>
		</Main>
	);
};

export default SegmentationSurveyStep;
