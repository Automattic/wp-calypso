export type FeedbackType =
	| 'referral-completed'
	| 'team-member-invite-sent'
	| 'partner-directory-details-added'
	| 'purchase-completed';

export type FeedbackRating = 'bad' | 'neutral' | 'good';

export interface FeedbackSuggestion {
	label: string;
	value: string;
}

export interface FeedbackCopy {
	title: string;
	description: string;
	suggestion?: {
		label: string;
		options: FeedbackSuggestion[];
	};
}

export interface FeedbackAnswer {
	rating: FeedbackRating;
	comments: string;
	suggestions: string[];
}
