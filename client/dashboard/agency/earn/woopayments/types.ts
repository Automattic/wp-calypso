export interface SitesWithWooPaymentsState {
	blogId: number;
	siteUrl: string;
	state: string;
}

/**
 * Analytics callback injected by the host app so the shared commissions table/columns stay
 * app-agnostic (the dashboard passes `useAnalytics`, the classic A4A app passes a Redux-dispatch
 * wrapper).
 */
export type RecordTracksEvent = (
	eventName: string,
	properties?: Record< string, unknown >
) => void;
