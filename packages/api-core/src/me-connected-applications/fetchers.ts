import { wpcom } from '../wpcom-fetcher';
import type { ConnectedApplication } from './types';

export async function fetchConnectedApplications(): Promise< ConnectedApplication[] > {
	const response = await wpcom.req.get( '/me/connected-applications' );
	return response.connected_applications;
}
