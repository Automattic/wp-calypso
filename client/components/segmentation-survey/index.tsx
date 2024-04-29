import { useCallback } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import SurveyContainer from 'calypso/components/survey-container';
import { Question } from 'calypso/components/survey-container/types';
import {
	useCachedAnswers,
	useSaveAnswersMutation,
	useSurveyStructureQuery,
} from 'calypso/data/segmentaton-survey';
import useSegmentationSurveyNavigation from './hooks/use-segmentation-survey-navigation';

type SegmentationSurveyProps = {
	surveyKey: string;
	onBack?: () => void; // This is a function that navigates to the previous step
	onComplete?: () => void; // This is a function that navigates to the next step
};

const SegmentationSurvey = ( { surveyKey, onBack, onComplete }: SegmentationSurveyProps ) => {
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
			await mutateAsync( {
				questionKey: currentQuestion.key,
				answerKeys,
			} );

			if ( questions?.[ questions.length - 1 ].key === currentQuestion.key ) {
				clearAnswers();
				onComplete?.();
			}
		},
		[ clearAnswers, mutateAsync, onComplete, questions ]
	);

	const onContinue = useCallback(
		async ( currentQuestion: Question ) => {
			await handleSave( currentQuestion, answers[ currentQuestion.key ] || [] );
		},
		[ answers, handleSave ]
	);

	const onSkip = useCallback(
		async ( currentQuestion: Question ) => {
			await handleSave( currentQuestion, [ 'skip' ] );
		},
		[ handleSave ]
	);

	const { currentPage, currentQuestion, backToPreviousPage, continueToNextPage, skipToNextPage } =
		useSegmentationSurveyNavigation( {
			onBack,
			onContinue,
			onSkip,
			answers,
			questions,
			surveyKey,
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
			/>
		</>
	);
};

export default SegmentationSurvey;
