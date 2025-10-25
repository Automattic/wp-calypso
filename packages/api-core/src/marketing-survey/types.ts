export interface MarketingSurveyResponses {
	purchaseId: number;
	purchase: string;
	[ key: string ]: string | number | boolean;
}

export interface MarketingSurveyDetails {
	site_id: number;
	survey_id: string;
	survey_responses: MarketingSurveyResponses;
}
