export interface PaidPlanPurchaseSuccessJetpackStatsNoticeProps {
	onNoticeViewed?: () => void;
	isOdysseyStats: boolean;
}

export interface StatsNoticeProps {
	siteId: number | null;
	isOdysseyStats: boolean;
	onNoticeViewed?: () => void;
	onNoticeDismissed?: () => void;
	isWpcom?: boolean;
	isVip?: boolean;
	isP2?: boolean;
	isOwnedByTeam51?: boolean;
	hasPaidStats?: boolean;
	hasFreeStats?: boolean;
	isSiteJetpackNotAtomic?: boolean;
	statsPurchaseSuccess?: string;
	isCommercial?: boolean;
	isCommercialOwned?: boolean;
	isTierUpgradeNoticeEnabled?: boolean;
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
	isCommercial?: boolean;
}
