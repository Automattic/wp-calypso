import { wpcom } from '../wpcom-fetcher';
import type { DifmOfferBuildRequest, DifmOfferBuildRequestResponse } from './types';

export async function sendDifmOfferBuildRequest(
	siteId: number,
	data: DifmOfferBuildRequest
): Promise< DifmOfferBuildRequestResponse > {
	return wpcom.req.post(
		{
			path: `/sites/${ siteId }/difm-offer/build-request`,
			apiNamespace: 'wpcom/v2',
		},
		data
	);
}
