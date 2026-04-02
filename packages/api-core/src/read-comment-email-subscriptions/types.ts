export type UpdateSiteCommentEmailSubscriptionParams = {
	send_comments: boolean;
	blog_id: number | string;
};

export type UpdateSiteCommentEmailSubscriptionResponse = {
	success: boolean;
	subscribed: boolean;
};

export type DeletePostCommentEmailSubscriptionParams = {
	blog_id: number | string;
	post_id: number | string;
};

export type DeletePostCommentEmailSubscriptionResponse = {
	success: boolean;
	subscribed: boolean;
	subscription: null;
};
