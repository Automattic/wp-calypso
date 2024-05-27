import { useQuery } from '@tanstack/react-query';
import { Answers } from 'calypso/components/survey-container/types';
import wpcom from 'calypso/lib/wp';

type SurveyAnswersQueryParams = {
	surveyKey: string;
};

export type SurveyAnswersResponse = Array< {
	blog_id: number;
	answers: Answers;
} >;

const mapSurveyAnswers = ( response: SurveyAnswersResponse ): Answers =>
	response.reduce( ( acc, { answers } ) => {
		return { ...acc, ...answers };
	}, {} );

const useSurveyAnswersQuery = ( { surveyKey }: SurveyAnswersQueryParams ) => {
	return useQuery( {
		queryKey: [ 'survey-answers', surveyKey ],
		queryFn: () =>
			wpcom.req.get( {
				path: `/segmentation-survey/answers?survey_key=${ surveyKey }`,
				apiNamespace: 'wpcom/v2',
			} ),
		enabled: !! surveyKey,
		staleTime: 0,
		select: mapSurveyAnswers,
	} );
};

export default useSurveyAnswersQuery;
