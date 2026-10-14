import AsyncLoad from 'calypso/components/async-load';
import PageLoading from 'calypso/my-sites/stats/pages/shared/page-loading';
import type { Context } from '@automattic/calypso-router';

const loadPreConnection = () =>
	import( /* webpackChunkName: "async-load-odyssey-stats-pre-connection" */ '.' );

/**
 * Kept out of the main chunk: a connected site — every site today — never reaches this screen.
 */
export default function preConnection( context: Context, next: () => void ) {
	context.primary = <AsyncLoad require={ loadPreConnection } placeholder={ PageLoading } />;
	next();
}
