export interface StatsNoticeProps {
	siteId: number | null;
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
}
