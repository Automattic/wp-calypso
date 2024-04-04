import { DefaultError, useQuery } from '@tanstack/react-query';
import { QuestionType, Survey } from 'calypso/components/survey-container/types';
import wpcom from 'calypso/lib/wp';

type SurveyResponse = {
	survey_key: string;
	questions: {
		question_key: string;
		header_text: string;
		subheader_text: string;
		type: string;
		options: {
			label: string;
			help_text: string;
			value: string;
		}[];
	}[];
};

type SegmentationSurveyQueryType = {
	surveyKey: string;
};

const useSegmentationSurveyQuery = ( { surveyKey }: SegmentationSurveyQueryType ) => {
	return useQuery< SurveyResponse, DefaultError, Survey >( {
		queryKey: [ 'segmentation-survey', surveyKey ],
		queryFn: () => {
			return wpcom.req.get( {
				path: `/segmentation-survey/${ surveyKey }`,
				apiNamespace: 'wpcom/v2',
			} );
		},
		select: ( data ) => {
			return {
				key: data.survey_key,
				questions: data.questions.map( ( question ) => ( {
					key: question.question_key,
					headerText: question.header_text,
					subHeaderText: question.subheader_text,
					type: QuestionType[ question.type as keyof typeof QuestionType ],
					options: question.options.map( ( option ) => ( {
						label: option.label,
						helpText: option.help_text,
						value: option.value,
					} ) ),
				} ) ),
			};
		},
	} );
};

export default useSegmentationSurveyQuery;
