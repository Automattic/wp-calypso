import AsyncLoad from 'calypso/components/async-load';
import PageLoading from '../shared/page-loading';
import type { Context } from '@automattic/calypso-router';

setTimeout( () => import( 'calypso/my-sites/stats/pages/insights' ), 3000 );

function insights( context: Context, next: () => void ) {
	context.primary = (
		<AsyncLoad
			require="calypso/my-sites/stats/pages/insights"
			placeholder={ PageLoading }
			context={ context }
		/>
	);
	next();
}

export default insights;
