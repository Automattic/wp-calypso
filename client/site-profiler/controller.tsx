export function siteProfilerContext( context: PageJS.Context, next: () => void ): void {
	context.primary = <div>Primary content goes here</div>;

	next();
}
