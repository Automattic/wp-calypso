import AsyncLoad from 'calypso/components/async-load';
import PageLoading from '../shared/page-loading';
import type { Context } from '@automattic/calypso-router';

setTimeout(
	() => import( /* webpackChunkName: "async-load-calypso-my-sites-stats-pages-insights" */ '.' ),
	3000
);

function insights( context: Context, next: () => void ) {
	context.primary = (
		<AsyncLoad
			key="stats-pagesinsights"
			require={ () =>
				import( /* webpackChunkName: "async-load-calypso-my-sites-stats-pages-insights" */ '.' )
			}
			placeholder={ PageLoading }
			context={ context }
		/>
	);
	next();
}

export default insights;
