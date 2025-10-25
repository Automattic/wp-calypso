import { wpcom } from '../wpcom-fetcher';

export async function applyCancellationOffer(
	siteId: number,
	purchaseId: number
): Promise< void > {
	return wpcom.req.post( {
		path: '/cancellation-offers/apply',
		apiNamespace: 'wpcom/v2',
		body: {
			site: siteId,
			purchase: purchaseId,
		},
	} );
}
