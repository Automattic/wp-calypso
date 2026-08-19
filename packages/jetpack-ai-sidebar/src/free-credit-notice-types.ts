export interface JetpackAiChatNotice {
	message: string;
	status?: 'success' | 'warning' | 'error';
	action?: { label: string; onClick: () => void };
	dismissible?: boolean;
	/** The persistent notice replaces this specific backend rejection. */
	suppressCurrentError?: boolean;
}

export interface FreeCreditNoticeProps {
	error: string | null;
	enabled?: boolean;
	isWpcomPlatform?: boolean;
	onUpgradeClick?: ( upgradeUrl: string ) => void;
	rejectionNotice?: JetpackAiChatNotice;
	settledRequestCount?: number;
	siteId?: number;
}
