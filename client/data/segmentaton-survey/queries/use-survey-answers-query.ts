import { useQuery } from '@tanstack/react-query';
import { Answers } from 'calypso/components/survey-container/types';
import wpcom from 'calypso/lib/wp';

type SurveyAnswersQueryParams = {
	surveyKey: string;
	enabled?: boolean;
};

type SurveyAnswersResponse = {
	question_key: string;
	answer_keys: string[];
}[];

const mapSurveyAnswers = ( response: SurveyAnswersResponse ): Answers =>
	response.reduce( ( acc, { question_key, answer_keys } ) => {
		return { ...acc, [ question_key ]: answer_keys };
	}, {} );

const useSurveyAnswersQuery = ( { surveyKey, enabled = true }: SurveyAnswersQueryParams ) => {
	return useQuery( {
		queryKey: [ 'survey-answers', surveyKey ],
		queryFn: () => {
			return wpcom.req.get( {
				path: `/segmentation-survey/answers?survey_key=${ surveyKey }`,
				apiNamespace: 'wpcom/v2',
			} );
		},
		enabled: !! surveyKey && enabled,
		select: mapSurveyAnswers,
	} );
};

export default useSurveyAnswersQuery;
