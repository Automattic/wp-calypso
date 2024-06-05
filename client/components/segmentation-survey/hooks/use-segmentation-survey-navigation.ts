import { useCallback, useMemo } from 'react';
import { SKIP_ANSWER_KEY } from 'calypso/components/segmentation-survey/constants';
import { Answers, Question } from 'calypso/components/survey-container/types';
import { useHash } from 'calypso/landing/stepper/hooks/use-hash';
import useSegmentationSurveyTracksEvents from './use-segmentation-survey-tracks-events';

type SegmentationSurveyNavigationProps = {
	onBack?: () => void;
	onContinue?: ( currentQuestion: Question ) => Promise< void >;
	onSkip?: ( currentQuestion: Question ) => Promise< void >;
	surveyKey: string;
	questions?: Question[];
	answers: Answers;
	skipNextNavigation?: ( currentQuestionKey: string, answers: string[] ) => boolean;
	onGoToPage?: ( page: number ) => void;
	providedPage?: number | null;
};

/**
 * The default routing mechanism for the survey is hash-based.
 * @param page The number of the page to go to.
 */
function defaultGoToPage( page: number ) {
	window.location.hash = `${ page }`;
}

const useSegmentationSurveyNavigation = ( {
	onBack,
	onContinue,
	onSkip,
	surveyKey,
	questions,
	answers,
	skipNextNavigation,
	onGoToPage = defaultGoToPage,
	providedPage = null,
}: SegmentationSurveyNavigationProps ) => {
	const { recordBackEvent, recordContinueEvent, recordSkipEvent } =
		useSegmentationSurveyTracksEvents( surveyKey );

	const hash = useHash();

	// If the user of the hook doesn't provide a currentPage, we default to the page stored in the hash part of the URL.
	const defaultCurrentPage = useMemo(
		() => parseInt( hash.replace( '#', '' ), 10 ) || 1,
		[ hash ]
	);

	const currentPage = providedPage ?? defaultCurrentPage;

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

		onGoToPage( currentPage - 1 );
	}, [ currentPage, currentQuestion, onBack, recordBackEvent, onGoToPage ] );

	const nextPage = useCallback( () => {
		if ( currentPage === questions?.length ) {
			return;
		}

		onGoToPage( currentPage + 1 );
	}, [ currentPage, questions?.length, onGoToPage ] );

	const skipToNextPage = useCallback( async () => {
		if ( ! currentQuestion ) {
			return;
		}

		recordSkipEvent( currentQuestion );

		await onSkip?.( currentQuestion );
		if ( skipNextNavigation?.( currentQuestion.key, [ SKIP_ANSWER_KEY ] ) ) {
			return;
		}

		nextPage();
	}, [ currentQuestion, nextPage, onSkip, recordSkipEvent, skipNextNavigation ] );

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

		if ( skipNextNavigation?.( currentQuestion.key, answers?.[ currentQuestion.key ] ) ) {
			return;
		}

		nextPage();
	}, [
		answers,
		currentQuestion,
		nextPage,
		onContinue,
		recordContinueEvent,
		skipToNextPage,
		skipNextNavigation,
	] );

	return {
		currentQuestion,
		currentPage: currentPage,
		backToPreviousPage,
		continueToNextPage,
		skipToNextPage,
	};
};

export default useSegmentationSurveyNavigation;
