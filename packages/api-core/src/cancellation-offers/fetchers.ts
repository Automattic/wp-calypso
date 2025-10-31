import { wpcom } from '../wpcom-fetcher';
import { CancellationOffer } from './types';

export async function fetchCancellationOffers(
	siteId: number,
	purchaseId: number
): Promise< CancellationOffer[] > {
	return wpcom.req.get( {
		path: `/cancellation-offers?site=${ siteId }&purchase=${ purchaseId }`,
		apiNamespace: 'wpcom/v2',
	} );
}
