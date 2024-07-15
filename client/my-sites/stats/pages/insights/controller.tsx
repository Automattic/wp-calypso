import AsyncLoad from 'calypso/components/async-load';
import PageLoading from '../shared/page-loading';
import type { Context } from '@automattic/calypso-router';

function insights( context: Context, next: () => void ) {
	context.primary = (
		<AsyncLoad require="calypso/my-sites/stats/pages/insights" placeholder={ PageLoading } />
	);
	next();
}

export default insights;
