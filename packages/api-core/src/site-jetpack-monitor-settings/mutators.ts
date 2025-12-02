import { wpcom } from '../wpcom-fetcher';
import type { JetpackMonitorSettings, JetpackMonitorSettingsCreateResponse } from './types';

export async function createJetpackMonitorSettings(
	siteId: number,
	body: Partial< JetpackMonitorSettings >
): Promise< JetpackMonitorSettingsCreateResponse > {
	return await wpcom.req.post( {
		path: `/sites/${ siteId }/jetpack-monitor-settings`,
		apiNamespace: 'wpcom/v2',
		body,
	} );
}
