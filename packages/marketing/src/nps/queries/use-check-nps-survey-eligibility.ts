import { useQuery } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';
import { NpsEligibility, NpsEligibilityApiResponse } from '../types';

function useCheckNpsSurveyEligibility( surveyName: string ) {
	return useQuery( {
		queryKey: [ surveyName ],
		queryFn: async (): Promise< NpsEligibility > => {
			const response: NpsEligibilityApiResponse = await wpcomRequest( {
				path: '/nps',
				query: surveyName,
				apiVersion: '1.2',
			} );

			return {
				displaySurvey: response.display_survey,
				secondsUntilEligible: response.seconds_until_eligible,
				hasAvailableConciergeSessions: response.has_available_concierge_sessions,
			};
		},
	} );
}

export default useCheckNpsSurveyEligibility;
