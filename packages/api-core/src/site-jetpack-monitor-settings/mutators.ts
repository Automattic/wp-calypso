import { wpcom } from '../wpcom-fetcher';
import type { MonitorSettings, MonitorSettingsCreateResponse } from './types';

export async function createJetpackMonitorSettings(
	siteId: number,
	body: Partial< MonitorSettings >
): Promise< MonitorSettingsCreateResponse > {
	return await wpcom.req.post( {
		path: `/sites/${ siteId }/jetpack-monitor-settings`,
		apiNamespace: 'wpcom/v2',
		body,
	} );
}
