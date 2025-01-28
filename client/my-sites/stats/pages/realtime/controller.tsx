import AsyncLoad from 'calypso/components/async-load';
import PageLoading from '../shared/page-loading';
import type { Context } from '@automattic/calypso-router';

setTimeout( () => import( 'calypso/my-sites/stats/pages/realtime' ), 3000 );

function realtime( context: Context, next: () => void ) {
	context.primary = (
		<AsyncLoad require="calypso/my-sites/stats/pages/realtime" placeholder={ PageLoading } />
	);
	next();
}

export default realtime;
