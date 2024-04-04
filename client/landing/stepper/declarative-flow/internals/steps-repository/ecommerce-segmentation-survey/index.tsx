import config from '@automattic/calypso-config';
import DocumentHead from 'calypso/components/data/document-head';
import SurveyContainer from 'calypso/components/survey-container';
import { useSurveyContext } from 'calypso/components/survey-container/context';
import { Question } from 'calypso/components/survey-container/types';
import useCachedAnswers from './hooks/use-cached-answers';
import { mockQuestions } from './mock';
import useSaveAnswersMutation from './mutations/use-save-answers-mutation';
import EcommerceSegmentationSurveyProvider from './provider';
import useSegmentationSurveyQuery from './queries/use-segmentation-survey-query';
import type { Step } from '../../types';
import './style.scss';

const mockSurveyKey = 'ecommerce-segmentation-survey';

type CustomDocumentHeadType = {
	questions: Question[];
};

const CustomDocumentHead = ( { questions }: CustomDocumentHeadType ) => {
	const { currentPage } = useSurveyContext();
	const currentQuestion = questions[ currentPage - 1 ];

	if ( ! currentQuestion ) {
		return null;
	}

	return <DocumentHead title={ currentQuestion.headerText } />;
};

const EcommerceSegmentationSurvey: Step = ( { navigation } ) => {
	const { data: survey } = useSegmentationSurveyQuery();
	const surveyKey = survey?.key ?? mockSurveyKey;

	const { mutate } = useSaveAnswersMutation( { surveyKey } );
	const questions = survey?.questions ?? mockQuestions;

	const { answers, setAnswers } = useCachedAnswers( surveyKey );

	const recordTracksEvent = () => {};

	if ( ! config.isEnabled( 'ecommerce-segmentation-survey' ) ) {
		return null;
	}

	const onChangeAnswer = ( questionKey: string, value: string[] ) => {
		const newAnswers = { ...answers, [ questionKey ]: value };
		setAnswers( newAnswers );
	};

	const onSubmitQuestion = ( currentPage: number, skip: boolean ) => {
		const currentQuestion = questions[ currentPage - 1 ];

		mutate( {
			questionKey: currentQuestion.key,
			answerKeys: skip ? [] : answers[ currentQuestion.key ] || [],
		} );
	};

	return (
		<EcommerceSegmentationSurveyProvider
			navigation={ navigation }
			onSubmitQuestion={ onSubmitQuestion }
			totalPages={ questions.length }
		>
			<CustomDocumentHead questions={ questions } />

			<SurveyContainer
				answers={ answers }
				onChange={ onChangeAnswer }
				questions={ questions }
				recordTracksEvent={ recordTracksEvent }
			/>
		</EcommerceSegmentationSurveyProvider>
	);
};

export default EcommerceSegmentationSurvey;
