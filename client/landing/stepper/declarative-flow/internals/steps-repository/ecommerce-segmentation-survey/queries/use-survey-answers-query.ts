import { useQuery } from '@tanstack/react-query';
import { Answers } from 'calypso/components/survey-container/types';
import wpcom from 'calypso/lib/wp';

type SurveyAnswersQueryParams = {
	surveyKey: string;
};

type SurveyAnswersResponse = {
	question_key: string;
	answer_key: string;
}[];

const mapSurveyAnswers = ( response: SurveyAnswersResponse ): Answers => {
	return response.reduce( ( acc: Record< string, string[] >, { question_key, answer_key } ) => {
		acc[ question_key ] = [ ...( acc[ question_key ] || [] ), answer_key ];
		return acc;
	}, {} );
};

const useSurveyAnswersQuery = ( { surveyKey }: SurveyAnswersQueryParams ) => {
	return useQuery( {
		queryKey: [ 'survey-answers', surveyKey ],
		queryFn: () => {
			return wpcom.req.get( {
				path: `/segmentation-survey/answers?survey_key=${ surveyKey }`,
				apiNamespace: 'wpcom/v2',
			} );
		},
		enabled: !! surveyKey,
		select: mapSurveyAnswers,
	} );
};

export default useSurveyAnswersQuery;
