import { useMutation } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import type { APIFetchOptions } from './types';

type SurveyResponseRatingPayload = {
	survey_response_id: string;
	access_token: string;
	score: 'good' | 'bad';
	comment?: string;
	reason_option_id?: string;
	test_mode?: boolean;
};

export type SurveyReasonOption = {
	id: string;
	label: string;
};

/**
 * The survey's real closed-ended "reason" question, if it has one -- present on every
 * response regardless of whether a reason was submitted, so the caller can render the
 * survey-configured options for a follow-up submission.
 */
export type SurveyReasonQuestion = {
	question_id: string;
	options: SurveyReasonOption[];
} | null;

type SurveyResponseRatingResult = {
	reason_question?: SurveyReasonQuestion;
};

export const useRateSurveyResponse = () => {
	return useMutation( {
		mutationFn: ( payload: SurveyResponseRatingPayload ): Promise< SurveyResponseRatingResult > => {
			return canAccessWpcomApis()
				? wpcomRequest( {
						path: '/help/csat-survey-response',
						apiNamespace: 'wpcom/v2',
						method: 'POST',
						body: payload,
				  } )
				: apiFetch< SurveyResponseRatingResult >( {
						global: true,
						path: '/help-center/csat-survey-response',
						method: 'POST',
						data: payload,
				  } as APIFetchOptions );
		},
	} );
};
