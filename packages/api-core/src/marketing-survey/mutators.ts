import { wpcom } from '../wpcom-fetcher';
import { A4AFeedbackSurveyDetails, MarketingSurveyDetails } from './types';

export async function submitMarketingSurvey( data: MarketingSurveyDetails ): Promise< void > {
	return await wpcom.req.post( '/marketing/survey', {
		survey_id: data.survey_id,
		site_id: data.site_id,
		survey_responses: data.survey_responses,
	} );
}

interface A4AFeedbackSurveyResponse {
	success: boolean;
	err: string | null;
}

// A4A files its milestone surveys through wpcom/v2, as the classic dashboard does.
export async function submitA4AFeedbackSurvey( data: A4AFeedbackSurveyDetails ): Promise< void > {
	const response: A4AFeedbackSurveyResponse = await wpcom.req.post( {
		apiNamespace: 'wpcom/v2',
		path: '/marketing/survey',
		body: data,
	} );
	// A rejection arrives as a 200 with success: false, and must not count as filed.
	if ( ! response.success ) {
		throw new Error( response.err ?? 'The survey was not recorded.' );
	}
}
