import config from '@automattic/calypso-config';
import AsyncLoad from 'calypso/components/async-load';
import LoadStatsPage from '../../stats-redirect/load-stats-page';
import PageLoading from '../shared/page-loading';
import type { Context } from '@automattic/calypso-router';

const isPurchaseFlowEnabled = config.isEnabled( 'stats/checkout-flows-v2' );

function insights( context: Context, next: () => void ) {
	context.primary = isPurchaseFlowEnabled ? (
		<LoadStatsPage>
			<AsyncLoad require="calypso/my-sites/stats/pages/insights" placeholder={ PageLoading } />
		</LoadStatsPage>
	) : (
		<AsyncLoad require="calypso/my-sites/stats/pages/insights" placeholder={ PageLoading } />
	);
	next();
}

export default insights;
