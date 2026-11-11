/**
 * Where "Learn about tier benefits" goes. The paths differ between the dashboards
 * that show this screen, and `onNavigate` lets a router handle the click.
 */
export interface AmplifyTiersLink {
	tiersPath?: string;
	onNavigate?: ( path: string ) => void;
}
