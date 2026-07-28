export enum FeedbackType {
	MemberInviteSent = 'team-member-invite-sent',
}

export type FeedbackSuggestionOption = {
	label: string;
	value: string;
};

export type FeedbackResponses = {
	experience: string;
	comment: string;
	suggestions: string[];
};

export interface FeedbackConfig {
	title: string;
	getDescription: ( args: Record< string, string | undefined > ) => string;
	defaultReturnTo: string;
	suggestion?: {
		label: string;
		options: FeedbackSuggestionOption[];
	};
}
