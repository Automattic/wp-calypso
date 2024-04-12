import config from '@automattic/calypso-config';
import DocumentHead from 'calypso/components/data/document-head';
import SurveyContainer from 'calypso/components/survey-container';
import { useSurveyContext } from 'calypso/components/survey-container/context';
import { Question } from 'calypso/components/survey-container/types';
import useCachedAnswers from './hooks/use-cached-answers';
import useSaveAnswersMutation from './mutations/use-save-answers-mutation';
import EcommerceSegmentationSurveyProvider from './provider';
import useSurveyStructureQuery from './queries/use-survey-structure-query';
import type { Step } from '../../types';
import './style.scss';

const surveyKey = 'survey-1';

const CustomDocumentHead = () => {
	const { currentQuestion } = useSurveyContext();

	if ( ! currentQuestion ) {
		return null;
	}

	return <DocumentHead title={ currentQuestion.headerText } />;
};

const EcommerceSegmentationSurvey: Step = ( { navigation } ) => {
	const { data: questions } = useSurveyStructureQuery( { surveyKey } );
	const { mutate } = useSaveAnswersMutation( { surveyKey } );
	const { answers, setAnswers } = useCachedAnswers( surveyKey );

	const recordTracksEvent = () => {};

	if ( ! config.isEnabled( 'ecommerce-segmentation-survey' ) ) {
		return null;
	}

	const onChangeAnswer = ( questionKey: string, value: string[] ) => {
		const newAnswers = { ...answers, [ questionKey ]: value };
		setAnswers( newAnswers );
	};

	const onSubmitQuestion = ( currentQuestion: Question ) => {
		mutate( {
			questionKey: currentQuestion.key,
			answerKeys: answers[ currentQuestion.key ] || [],
		} );
	};

	return (
		<EcommerceSegmentationSurveyProvider
			navigation={ navigation }
			onSubmitQuestion={ onSubmitQuestion }
			questions={ questions }
		>
			<CustomDocumentHead />

			<SurveyContainer
				answers={ answers }
				onChange={ onChangeAnswer }
				recordTracksEvent={ recordTracksEvent }
			/>
		</EcommerceSegmentationSurveyProvider>
	);
};

export default EcommerceSegmentationSurvey;
