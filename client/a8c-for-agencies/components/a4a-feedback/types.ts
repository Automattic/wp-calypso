export type ModalType = 'referral-complete' | 'agency-details-added' | 'member-invite-send';
export type ModalData = {
	title: string;
	description: string;
	questionDetails: string;
};

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
