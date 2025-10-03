import { wpcom } from '../wpcom-fetcher';
import type { PluginsResponse } from './types';

export async function fetchUserSitesPlugins(): Promise< PluginsResponse > {
	return await wpcom.req.get( { path: '/me/sites/plugins', apiVersion: '1.1' } );
}
