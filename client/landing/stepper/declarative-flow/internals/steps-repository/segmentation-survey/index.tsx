import config from '@automattic/calypso-config';
import { useCallback } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import SurveyContainer from 'calypso/components/survey-container';
import { useSurveyContext } from 'calypso/components/survey-container/context';
import { Question } from 'calypso/components/survey-container/types';
import {
	useCachedAnswers,
	useSaveAnswersMutation,
	useSurveyStructureQuery,
} from 'calypso/data/segmentaton-survey';
import SegmentationSurveyProvider from './provider';
import type { Step } from '../../types';
import './style.scss';

const SURVEY_KEY = 'entrepreneur-trial';

const SegmentationSurveyDocumentHead = () => {
	const { currentQuestion } = useSurveyContext();

	if ( ! currentQuestion ) {
		return null;
	}

	return <DocumentHead title={ currentQuestion.headerText } />;
};

const SegmentationSurveyStep: Step = ( { navigation } ) => {
	const { data: questions } = useSurveyStructureQuery( { surveyKey: SURVEY_KEY } );
	const { mutate, isPending } = useSaveAnswersMutation( { surveyKey: SURVEY_KEY } );
	const { answers, setAnswers, clearAnswers } = useCachedAnswers( SURVEY_KEY );

	const onChangeAnswer = useCallback(
		( questionKey: string, value: string[] ) => {
			const newAnswers = { ...answers, [ questionKey ]: value };
			setAnswers( newAnswers );
		},
		[ answers, setAnswers ]
	);

	const clearAnswersOnComplete = useCallback(
		( currentQuestion: Question ) => {
			if ( questions?.[ questions.length - 1 ].key === currentQuestion.key ) {
				clearAnswers();
			}
		},
		[ clearAnswers, questions ]
	);

	const onSkipQuestion = useCallback(
		( currentQuestion: Question ) => {
			setAnswers( { ...answers, [ currentQuestion.key ]: [] } );

			mutate( {
				questionKey: currentQuestion.key,
				answerKeys: [ 'skip' ],
			} );

			clearAnswersOnComplete( currentQuestion );
		},
		[ answers, clearAnswersOnComplete, mutate, setAnswers ]
	);

	const onSubmitQuestion = useCallback(
		( currentQuestion: Question ) => {
			if ( isPending ) {
				return;
			}

			mutate(
				{
					questionKey: currentQuestion.key,
					answerKeys: answers[ currentQuestion.key ] || [],
				},
				{
					onSuccess: () => {
						clearAnswersOnComplete( currentQuestion );
					},
				}
			);
		},
		[ answers, clearAnswersOnComplete, isPending, mutate ]
	);

	if ( ! config.isEnabled( 'ecommerce-segmentation-survey' ) ) {
		return null;
	}

	return (
		<Main className="segmentation-survey-step">
			<SegmentationSurveyProvider
				navigation={ navigation }
				onSkipQuestion={ onSkipQuestion }
				onSubmitQuestion={ onSubmitQuestion }
				surveyKey={ SURVEY_KEY }
				questions={ questions }
				answers={ answers }
			>
				<SegmentationSurveyDocumentHead />

				<SurveyContainer answers={ answers } onChange={ onChangeAnswer } />
			</SegmentationSurveyProvider>
		</Main>
	);
};

export default SegmentationSurveyStep;
