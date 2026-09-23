import { wpcom } from '../wpcom-fetcher';
import { MarketingSurveyDetails } from './types';

export async function submitMarketingSurvey( data: MarketingSurveyDetails ): Promise< void > {
	return await wpcom.req.post( '/marketing/survey', {
		survey_id: data.survey_id,
		site_id: data.site_id,
		survey_responses: data.survey_responses,
	} );
}

// A4A files its milestone surveys through wpcom/v2, as the classic dashboard does.
export async function submitA4AFeedbackSurvey( data: MarketingSurveyDetails ): Promise< void > {
	return await wpcom.req.post( {
		apiNamespace: 'wpcom/v2',
		path: '/marketing/survey',
		body: data,
	} );
}
