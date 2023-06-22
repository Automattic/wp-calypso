export interface StatsNoticeProps {
	siteId: number | null;
}

export interface NoticeProps {
	onNoticeDismiss: () => void;
}

export interface FeedbackNoticeProps extends NoticeProps {
	onTakeSurveyClick: () => void;
	onRemindMeLaterClick: () => void;
}
