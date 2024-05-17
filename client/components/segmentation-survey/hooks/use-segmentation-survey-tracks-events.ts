import { useCallback } from 'react';
import { Answers, Question } from 'calypso/components/survey-container/types';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';

const useSegmentationSurveyTracksEvents = ( surveyKey: string ) => {
	const recordBackEvent = useCallback(
		( currentQuestion: Question ) => {
			recordTracksEvent( 'calypso_segmentation_survey_back', {
				survey_key: surveyKey,
				question_key: currentQuestion.key,
			} );
		},
		[ surveyKey ]
	);

	const recordCompleteEvent = useCallback( () => {
		recordTracksEvent( 'calypso_segmentation_survey_complete', {
			survey_key: surveyKey,
		} );
	}, [ surveyKey ] );

	const recordContinueEvent = useCallback(
		( currentQuestion: Question, answers: Answers ) => {
			recordTracksEvent( 'calypso_segmentation_survey_continue', {
				survey_key: surveyKey,
				question_key: currentQuestion.key,
				answer_keys: answers?.[ currentQuestion.key ].join( ',' ) || '',
			} );
		},
		[ surveyKey ]
	);

	const recordSkipEvent = useCallback(
		( currentQuestion: Question ) => {
			recordTracksEvent( 'calypso_segmentation_survey_skip', {
				survey_key: surveyKey,
				question_key: currentQuestion.key,
			} );
		},
		[ surveyKey ]
	);

	const recordStartEvent = useCallback( () => {
		recordTracksEvent( 'calypso_segmentation_survey_start', {
			survey_key: surveyKey,
		} );
	}, [ surveyKey ] );

	return {
		recordBackEvent,
		recordCompleteEvent,
		recordContinueEvent,
		recordSkipEvent,
		recordStartEvent,
	};
};

export default useSegmentationSurveyTracksEvents;
