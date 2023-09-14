import config from '@automattic/calypso-config';
import page from 'page';
import Main from 'calypso/components/main';
import SiteProfiler from 'calypso/site-profiler/components/site-profiler';

export function siteProfilerContext( context: PageJS.Context, next: () => void ): void {
	if ( ! config.isEnabled( 'site-profiler' ) ) {
		page.redirect( '/' );
	}

	context.primary = (
		<Main wideLayout>
			<SiteProfiler />
		</Main>
	);

	next();
}
