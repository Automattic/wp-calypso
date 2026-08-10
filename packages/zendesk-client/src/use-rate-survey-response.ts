import { useMutation } from '@tanstack/react-query';
import apiFetch, { APIFetchOptions } from '@wordpress/api-fetch';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';

type SurveyResponseRatingPayload = {
	survey_response_id: string;
	access_token: string;
	score: 'good' | 'bad';
	comment?: string;
	zendesk_origin: string;
	test_mode?: boolean;
};

export const useRateSurveyResponse = () => {
	return useMutation( {
		mutationFn: ( payload: SurveyResponseRatingPayload ) => {
			return canAccessWpcomApis()
				? wpcomRequest( {
						path: '/help/csat-survey-response',
						apiNamespace: 'wpcom/v2',
						method: 'POST',
						body: payload,
				  } )
				: apiFetch( {
						global: true,
						path: '/help-center/csat-survey-response',
						method: 'POST',
						data: payload,
				  } as APIFetchOptions );
		},
	} );
};
