import AsyncLoad from 'calypso/components/async-load';
import LoadStatsPage from '../../stats-redirect/load-stats-page';
import PageLoading from '../shared/page-loading';
import type { Context } from '@automattic/calypso-router';

function insights( context: Context, next: () => void ) {
	context.primary = (
		<LoadStatsPage>
			<AsyncLoad require="calypso/my-sites/stats/pages/insights" placeholder={ PageLoading } />
		</LoadStatsPage>
	);
	next();
}

export default insights;
