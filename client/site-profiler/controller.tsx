import config from '@automattic/calypso-config';
import page from 'page';
import { BrowserRouter } from 'react-router-dom';
import Main from 'calypso/components/main';
import SiteProfiler from 'calypso/site-profiler/components/site-profiler';

export function siteProfilerContext( context: PageJS.Context, next: () => void ): void {
	if ( ! config.isEnabled( 'site-profiler' ) ) {
		page.redirect( '/' );
		return;
	}

	context.primary = (
		<BrowserRouter>
			<Main fullWidthLayout>
				<SiteProfiler />
			</Main>
		</BrowserRouter>
	);

	next();
}
