export interface StatsNoticeProps {
	siteId?: number | null;
	onNoticeViewed?: () => void;
}

export interface NoticeBodyProps {
	onNoticeDismiss?: () => void;
}

export interface FeedbackNoticeBodyProps extends NoticeBodyProps {
	onTakeSurveyClick: () => void;
	onRemindMeLaterClick: () => void;
}

export interface StatsNoticesProps {
	siteId: number | null;
	isOdysseyStats: boolean;
	statsPurchaseSuccess?: string;
}

export interface NewStatsNoticesProps {
	siteId: number | null;
	isOdysseyStats?: boolean;
}

export interface PurchaseNoticesProps extends NewStatsNoticesProps {
	statsPurchaseSuccess: string | undefined;
}
