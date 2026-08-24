import { wpcom } from '../wpcom-fetcher';

export interface DismissReadSiteRecommendationParams {
	siteId: number;
}

export interface DismissReadSiteRecommendationResponse {
	success: boolean;
}

export const dismissReadSiteRecommendation = async ( {
	siteId,
}: DismissReadSiteRecommendationParams ): Promise< DismissReadSiteRecommendationResponse > => {
	const response = await wpcom.req.post(
		{
			path: `/me/dismiss/sites/${ siteId }/new`,
			apiVersion: '1.1',
		},
		{}
	);

	if ( ! response.success ) {
		throw new Error( 'Site dismiss was unsuccessful' );
	}

	return response;
};
