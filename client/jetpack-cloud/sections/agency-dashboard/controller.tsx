export function agencyDashboardContext( context: PageJS.Context, next: () => void ): void {
	context.primary = <div>Agency dashboard placeholder</div>;
	next();
}
