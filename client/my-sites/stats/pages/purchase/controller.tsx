import AsyncLoad from 'calypso/components/async-load';
import StatsPageLoader from '../../stats-page-loader';
import PageLoading from '../shared/page-loading';
import type { Context } from '@automattic/calypso-router';

function purchase( context: Context, next: () => void ) {
	context.primary = (
		<StatsPageLoader>
			<AsyncLoad
				require="calypso/my-sites/stats/pages/purchase"
				placeholder={ PageLoading }
				query={ context.query }
			/>
		</StatsPageLoader>
	);
	next();
}

export default purchase;
