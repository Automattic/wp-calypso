import AsyncLoad from 'calypso/components/async-load';
import PageLoading from '../shared/page-loading';
import type { Context } from '@automattic/calypso-router';

function purchase( context: Context, next: () => void ) {
	context.primary = (
		// DO NOT WRAP WITH <StatsPageLoader />
		// Or the site-less purchase flow will not work because there is no permission to access Stats.
		<AsyncLoad
			require="calypso/my-sites/stats/pages/purchase"
			placeholder={ PageLoading }
			query={ context.query }
		/>
	);
	next();
}

export default purchase;
