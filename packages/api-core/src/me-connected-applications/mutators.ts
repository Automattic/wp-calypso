import { wpcom } from '../wpcom-fetcher';
import { ConnectedApplicationSuccess } from './types';

export async function deleteConnectedApplication(
	appId: string
): Promise< ConnectedApplicationSuccess > {
	return wpcom.req.post( {
		path: `/me/connected-applications/${ appId }/delete`,
		body: {
			apiVersion: '1.1',
		},
	} );
}
