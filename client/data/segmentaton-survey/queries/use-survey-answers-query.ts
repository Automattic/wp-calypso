import { useQuery } from '@tanstack/react-query';
import { Answers } from 'calypso/components/survey-container/types';
import wpcom from 'calypso/lib/wp';

type SurveyAnswersQueryParams = {
	surveyKey: string;
	enabled?: boolean;
};

export type SurveyAnswersResponse = Array< {
	blog_id: number;
	answers: Answers;
} >;

const mapSurveyAnswers = ( response: SurveyAnswersResponse ): Record< string, Answers > =>
	response.reduce(
		( acc, { answers, blog_id } ) => {
			acc[ blog_id ] = answers;
			return acc;
		},
		{} as Record< string, Answers >
	);

const useSurveyAnswersQuery = ( { surveyKey, enabled = true }: SurveyAnswersQueryParams ) => {
	return useQuery( {
		queryKey: [ 'survey-answers', surveyKey ],
		queryFn: () =>
			wpcom.req.get( {
				path: `/segmentation-survey/answers?survey_key=${ surveyKey }`,
				apiNamespace: 'wpcom/v2',
			} ),
		enabled: enabled && !! surveyKey,
		staleTime: 0,
		select: mapSurveyAnswers,
	} );
};

export default useSurveyAnswersQuery;
