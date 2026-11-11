/**
 * Where "Learn about tier benefits" goes. The paths differ between the dashboards
 * that show this screen, and `onNavigate` lets a router handle the click.
 */
export interface AmplifyTiersLink {
	tiersPath?: string;
	onNavigate?: ( path: string ) => void;
}

/**
 * Whether the URL asks for the New report modal, e.g. from the Tiers page, and how
 * to drop that from the URL once the modal closes. Each dashboard owns its URL.
 */
export interface AmplifyNewReportRequest {
	isRequested: boolean;
	onClear: () => void;
}
