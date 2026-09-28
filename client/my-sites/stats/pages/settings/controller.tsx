import AsyncLoad from 'calypso/components/async-load';
import PageLoading from '../shared/page-loading';
import type { Context } from '@automattic/calypso-router';

const loadSettings = () =>
	import( /* webpackChunkName: "async-load-calypso-my-sites-stats-pages-settings" */ '.' );

function settings( context: Context, next: () => void ) {
	context.primary = (
		<AsyncLoad require={ loadSettings } placeholder={ PageLoading } context={ context } />
	);
	next();
}

export default settings;
