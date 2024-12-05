export type FeedbackType = 'referral-complete' | 'agency-details-added' | 'member-invite-sent';
export type FeedbackData = {
	title: string;
	description: string;
	questionDetails: string;
};
export type FeedbackQueryData = {
	experience: string;
	comments: string;
};

export type FeedbackProps = {
	title: string;
	description: string;
	questionDetails: string;
	ctaText: string;
	redirectUrl?: string;
};

export interface MutationSaveFeedbackVariables {
	params: {
		feedback_name: FeedbackType;
		feedback_rating: string;
		feedback_comment: string;
	};
}
