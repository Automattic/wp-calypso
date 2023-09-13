import Main from 'calypso/components/main';
import SiteProfiler from 'calypso/site-profiler/components/site-profiler';

export function siteProfilerContext( context: PageJS.Context, next: () => void ): void {
	context.primary = (
		<Main wideLayout>
			<SiteProfiler />
		</Main>
	);

	next();
}
