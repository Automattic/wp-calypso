import { useCallback, useMemo } from 'react';
import { useLocation } from 'react-router';
import { Answers, Question } from 'calypso/components/survey-container/types';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';

type SegmentationSurveyNavigationProps = {
	onBack?: () => void;
	onContinue?: ( currentQuestion: Question ) => Promise< void >;
	onSkip?: ( currentQuestion: Question ) => Promise< void >;
	surveyKey: string;
	questions?: Question[];
	answers: Answers;
};

const useSegmentationSurveyNavigation = ( {
	onBack,
	onContinue,
	onSkip,
	surveyKey,
	questions,
	answers,
}: SegmentationSurveyNavigationProps ) => {
	const { hash } = useLocation();
	const currentPage = useMemo( () => parseInt( hash.replace( '#', '' ), 10 ) || 1, [ hash ] );

	const currentQuestion = useMemo(
		() => questions?.[ currentPage - 1 ],
		[ currentPage, questions ]
	);

	const backToPreviousPage = useCallback( () => {
		if ( ! currentQuestion ) {
			return;
		}

		recordTracksEvent( 'calypso_segmentation_survey_back', {
			survey_key: surveyKey,
			question_key: currentQuestion.key,
		} );

		if ( currentPage === 1 ) {
			onBack?.();
			return;
		}

		window.location.hash = `${ currentPage - 1 }`;
	}, [ currentPage, currentQuestion, onBack, surveyKey ] );

	const nextPage = useCallback( () => {
		if ( currentPage === questions?.length ) {
			return;
		}

		window.location.hash = `${ currentPage + 1 }`;
	}, [ currentPage, questions?.length ] );

	const skipToNextPage = useCallback( async () => {
		if ( ! currentQuestion ) {
			return;
		}

		recordTracksEvent( 'calypso_segmentation_survey_skip', {
			survey_key: surveyKey,
			question_key: currentQuestion.key,
		} );

		await onSkip?.( currentQuestion );
		nextPage();
	}, [ currentQuestion, nextPage, onSkip, surveyKey ] );

	const continueToNextPage = useCallback( async () => {
		if ( ! currentQuestion ) {
			return;
		}

		if ( ! answers?.[ currentQuestion.key ] ) {
			await skipToNextPage();
			return;
		}

		recordTracksEvent( 'calypso_segmentation_survey_continue', {
			survey_key: surveyKey,
			question_key: currentQuestion.key,
			answer_keys: answers?.[ currentQuestion.key ].join( ',' ) || '',
		} );

		await onContinue?.( currentQuestion );
		nextPage();
	}, [ answers, currentQuestion, nextPage, onContinue, skipToNextPage, surveyKey ] );

	return {
		currentQuestion,
		currentPage,
		backToPreviousPage,
		continueToNextPage,
		skipToNextPage,
	};
};

export default useSegmentationSurveyNavigation;
