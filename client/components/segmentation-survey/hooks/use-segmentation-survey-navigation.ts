import { useCallback, useMemo } from 'react';
import { useLocation } from 'react-router';
import { Answers, Question } from 'calypso/components/survey-container/types';
import useSegmentationSurveyTracksEvents from './use-segmentation-survey-tracks-events';

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
	const { recordBackEvent, recordContinueEvent, recordSkipEvent } =
		useSegmentationSurveyTracksEvents( surveyKey );
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

		recordBackEvent( currentQuestion );

		if ( currentPage === 1 ) {
			onBack?.();
			return;
		}

		window.location.hash = `${ currentPage - 1 }`;
	}, [ currentPage, currentQuestion, onBack, recordBackEvent ] );

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

		recordSkipEvent( currentQuestion );

		await onSkip?.( currentQuestion );
		nextPage();
	}, [ currentQuestion, nextPage, onSkip, recordSkipEvent ] );

	const continueToNextPage = useCallback( async () => {
		if ( ! currentQuestion ) {
			return;
		}

		if ( ! answers?.[ currentQuestion.key ] ) {
			await skipToNextPage();
			return;
		}

		recordContinueEvent( currentQuestion, answers );

		await onContinue?.( currentQuestion );
		nextPage();
	}, [ answers, currentQuestion, nextPage, onContinue, recordContinueEvent, skipToNextPage ] );

	return {
		currentQuestion,
		currentPage,
		backToPreviousPage,
		continueToNextPage,
		skipToNextPage,
	};
};

export default useSegmentationSurveyNavigation;
