export type FeedbackType =
	| 'referral-complete'
	| 'agency-details-added'
	| 'member-invite-sent'
	| 'purchase-complete';

export type FeedbackQueryData = {
	experience: string;
	comments: string;
	suggestions?: string[];
};

export type FeedbackSuggestion = {
	label: string;
	value: string;
	text: string;
};

export type FeedbackProps = {
	title: string;
	description: string;
	redirectUrl?: string;
	suggestion?: {
		label: string;
		options: FeedbackSuggestion[];
	};
};

interface FeedbackSurveyResponses {
	rating: string;
	comment: string;
	suggestions?: string;
}
export interface FeedbackSurveyResponsesPayload {
	site_id: number;
	survey_id: FeedbackType;
	survey_responses: FeedbackSurveyResponses;
}

export interface MutationSaveFeedbackVariables {
	params: FeedbackSurveyResponsesPayload;
}
