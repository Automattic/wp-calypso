export interface MarketingSurveyResponse {
	text?: string;
	response?: string | boolean | number;
}

export interface MarketingSurveyResponses {
	purchaseId: number;
	purchase: string;
	[ key: string ]: string | number | MarketingSurveyResponse;
}

export interface MarketingSurveyDetails {
	site_id: number;
	survey_id: string;
	survey_responses: MarketingSurveyResponses;
}

export interface A4AFeedbackSurveyDetails {
	site_id: number;
	survey_id: string;
	survey_responses: {
		rating?: string;
		comment: { text: string };
		suggestions: { text: string };
		cta?: string;
		meta?: {
			product_name: string;
			license_key: string;
			license_type: 'client' | 'agency';
		};
	};
}
