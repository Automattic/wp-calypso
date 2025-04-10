export enum FeedbackType {
	ReferralCompleted = 'referral-completed',
	PDDetailsAdded = 'partner-directory-details-added',
	MemberInviteSent = 'team-member-invite-sent',
	PurchaseCompleted = 'purchase-completed',
	LicenseCancelProduct = 'license-cancel-product',
	LicenseCancelHosting = 'license-cancel-hosting',
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
	rating?: string;
	comment: { text: string };
	suggestions?: { text: string };
	cta?: string;
	meta?: {
		product_name: string;
		license_key: string;
		license_type: string;
	};
}
export interface FeedbackSurveyResponsesPayload {
	site_id: number;
	survey_id: FeedbackType;
	survey_responses: FeedbackSurveyResponses;
}

export interface MutationSaveFeedbackVariables {
	params: FeedbackSurveyResponsesPayload;
}
