export enum FeedbackType {
	ReferralCompleted = 'referral-completed',
	PDDetailsAdded = 'partner-directory-details-added',
	MemberInviteSent = 'team-member-invite-sent',
	PurchaseCompleted = 'purchase-completed',
}

export type FeedbackQueryData = {
	experience: string;
	comments: string;
	suggestions?: string[];
};

export type FeedbackSuggestion = {
	label: string;
	value: string;
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
	comment: { text: string };
	suggestions?: { text: string };
}
export interface FeedbackSurveyResponsesPayload {
	site_id: number;
	survey_id: FeedbackType;
	survey_responses: FeedbackSurveyResponses;
}

export interface MutationSaveFeedbackVariables {
	params: FeedbackSurveyResponsesPayload;
}
