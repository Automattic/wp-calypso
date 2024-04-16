import config from '@automattic/calypso-config';
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

const SURVEY_KEY = 'survey-1';

const CustomDocumentHead = () => {
	const { currentQuestion } = useSurveyContext();

	if ( ! currentQuestion ) {
		return null;
	}

	return <DocumentHead title={ currentQuestion.headerText } />;
};

const SegmentationSurveyStep: Step = ( { navigation } ) => {
	const { data: questions } = useSurveyStructureQuery( { surveyKey: SURVEY_KEY } );
	const { mutate } = useSaveAnswersMutation( { surveyKey: SURVEY_KEY } );
	const { answers, setAnswers } = useCachedAnswers( SURVEY_KEY );

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
		<Main>
			<SegmentationSurveyProvider
				navigation={ navigation }
				onSubmitQuestion={ onSubmitQuestion }
				questions={ questions }
			>
				<CustomDocumentHead />

				<SurveyContainer
					answers={ answers }
					onChange={ onChangeAnswer }
					recordTracksEvent={ () => undefined }
				/>
			</SegmentationSurveyProvider>
		</Main>
	);
};

export default SegmentationSurveyStep;
