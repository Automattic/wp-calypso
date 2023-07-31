export interface PaidPlanPurchaseSuccessJetpackStatsNoticeProps {
	onNoticeViewed?: () => void;
}

export interface StatsNoticeProps {
	siteId: number | null;
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
	isOdysseyStats?: boolean;
	statsPurchaseSuccess?: string;
}
