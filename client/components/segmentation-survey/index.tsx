import React, { useCallback } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import SurveyContainer from 'calypso/components/survey-container';
import { QuestionComponentMap } from 'calypso/components/survey-container/components/question-step-mapping';
import { Question, QuestionConfiguration } from 'calypso/components/survey-container/types';
import {
	useCachedAnswers,
	useSaveAnswersMutation,
	useSurveyStructureQuery,
} from 'calypso/data/segmentaton-survey';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { SKIP_ANSWER_KEY } from './constants';
import useSegmentationSurveyNavigation from './hooks/use-segmentation-survey-navigation';

type SegmentationSurveyProps = {
	/**
	 * The key of the survey to render.
	 */
	surveyKey: string;
	/**
	 * A function that will be called when the user navigates back.
	 */
	onBack?: () => void;
	/**
	 * A function that will be called when the user navigates forward.
	 */
	onNext?: ( questionKey: string, answerKeys: string[], isLastQuestion?: boolean ) => void;
	/**
	 * A function that determines whether to skip the next navigation.
	 */
	skipNextNavigation?: ( questionKey: string, answerKeys: string[] ) => boolean;
	/**
	 * The alignment of the header text.
	 */
	headerAlign?: 'center' | 'left' | 'right';
	/**
	 * The configuration for the questions.
	 */
	questionConfiguration?: QuestionConfiguration;
	/**
	 * A map of question types to components.
	 */
	questionComponentMap?: QuestionComponentMap;
	/**
	 * Whether to clear the answers after the last question.
	 */
	clearAnswersOnLastQuestion?: boolean;
	/**
	 * Requires `providedPage` prop. If you want to manage your own navigation, you can provide a function that navigates to a specific page.
	 */
	onGoToPage?: ( page: number ) => void;
	/**
	 * Requires `onGoToPage` prop. If you want to manage your own navigation, you can provide the current page number.
	 */
	providedPage?: number;
};

/**
 * A component that renders a segmentation survey.
 */
const SegmentationSurvey = ( {
	surveyKey,
	onBack,
	onNext,
	skipNextNavigation,
	headerAlign,
	questionConfiguration,
	questionComponentMap,
	clearAnswersOnLastQuestion = true,
	onGoToPage,
	providedPage,
}: SegmentationSurveyProps ) => {
	const { data: questions } = useSurveyStructureQuery( { surveyKey } );
	const { mutateAsync, isPending } = useSaveAnswersMutation( { surveyKey } );
	const { answers, setAnswers, clearAnswers } = useCachedAnswers( surveyKey );

	const onChangeAnswer = useCallback(
		( questionKey: string, value: string[] ) => {
			const newAnswers = { ...answers, [ questionKey ]: value };
			setAnswers( newAnswers );
		},
		[ answers, setAnswers ]
	);

	const handleSave = useCallback(
		async ( currentQuestion: Question, answerKeys: string[] ) => {
			try {
				await mutateAsync( {
					questionKey: currentQuestion.key,
					answerKeys,
				} );

				const isLastQuestion = questions?.[ questions.length - 1 ].key === currentQuestion.key;

				if ( clearAnswersOnLastQuestion && isLastQuestion ) {
					clearAnswers();
				}

				onNext?.( currentQuestion.key, answerKeys, isLastQuestion );
			} catch ( e ) {
				const error = e as Error;

				recordTracksEvent( 'calypso_segmentation_survey_error', {
					survey_key: surveyKey,
					question_key: currentQuestion.key,
					answer_keys: answerKeys.join( ',' ),
					error_message: error.message,
				} );
			}
		},
		[ clearAnswers, clearAnswersOnLastQuestion, mutateAsync, onNext, questions, surveyKey ]
	);

	const onContinue = useCallback(
		async ( currentQuestion: Question ) => {
			const currentAnswers = answers[ currentQuestion.key ] || [];

			await handleSave(
				currentQuestion,
				currentAnswers.length ? currentAnswers : [ SKIP_ANSWER_KEY ]
			);
		},
		[ answers, handleSave ]
	);

	const onSkip = useCallback(
		async ( currentQuestion: Question ) => {
			onChangeAnswer( currentQuestion.key, [] );
			await handleSave( currentQuestion, [ SKIP_ANSWER_KEY ] );
		},
		[ handleSave, onChangeAnswer ]
	);

	const { currentPage, currentQuestion, backToPreviousPage, continueToNextPage, skipToNextPage } =
		useSegmentationSurveyNavigation( {
			onBack,
			onContinue,
			onSkip,
			answers,
			questions,
			surveyKey,
			skipNextNavigation,
			onGoToPage,
			providedPage,
		} );

	if ( ! questions ) {
		return null;
	}

	return (
		<>
			<DocumentHead title={ currentQuestion?.headerText } />

			<SurveyContainer
				questions={ questions }
				answers={ answers }
				currentPage={ currentPage }
				onBack={ backToPreviousPage }
				onContinue={ continueToNextPage }
				onSkip={ skipToNextPage }
				onChange={ onChangeAnswer }
				disabled={ isPending }
				headerAlign={ headerAlign }
				questionConfiguration={ questionConfiguration }
				questionComponentMap={ questionComponentMap }
			/>
		</>
	);
};

export default SegmentationSurvey;
