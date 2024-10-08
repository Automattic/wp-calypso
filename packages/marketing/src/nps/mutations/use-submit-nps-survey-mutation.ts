import { useMutation } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';
import { SubmitNpsSurveyParams, SubmitNpsSurveyResponse } from '../types';

// TBD
// Note that the current endpoint is designed to be able to take score/dismissed/feedback separately by one endpoint. We can consider to separate the endpoint, separate the hook, or separate the both later. Currently it justadheres the existing design to begin with.
function useSubmitNpsSurveyMutation( surveyName: string ) {
	return useMutation( {
		mutationFn: async ( { score, dismissed, feedback }: SubmitNpsSurveyParams ) => {
			const response = await wpcomRequest< SubmitNpsSurveyResponse >( {
				path: `/nps/${ surveyName }`,
				method: 'POST',
				body: {
					score,
					dismissed,
					feedback,
				},
			} );

			return response;
		},
	} );
}

export default useSubmitNpsSurveyMutation;
