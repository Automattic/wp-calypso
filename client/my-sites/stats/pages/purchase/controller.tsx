import StatsPurchasePage from 'calypso/my-sites/stats/pages/purchase';
import type { Context } from '@automattic/calypso-router';

function purchase( context: Context, next: () => void ) {
	context.primary = (
		// DO NOT WRAP WITH <LoadStatsPage /> or you will get an infinite loop
		<StatsPurchasePage query={ context.query } />
	);
	next();
}

export default purchase;
