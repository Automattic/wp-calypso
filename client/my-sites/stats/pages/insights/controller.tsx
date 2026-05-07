import AsyncLoad from 'calypso/components/async-load';
import PageLoading from '../shared/page-loading';
import type { Context } from '@automattic/calypso-router';

const loadInsights = () =>
	import( /* webpackChunkName: "async-load-calypso-my-sites-stats-pages-insights" */ '.' );

setTimeout( loadInsights, 3000 );

function insights( context: Context, next: () => void ) {
	context.primary = (
		<AsyncLoad require={ loadInsights } placeholder={ PageLoading } context={ context } />
	);
	next();
}

export default insights;
