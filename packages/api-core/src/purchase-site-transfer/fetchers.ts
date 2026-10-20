import { wpcom } from '../wpcom-fetcher';
import type { SiteTransferPreview } from './types';

export async function fetchPurchaseSiteTransferPreview(
	purchaseId: number,
	targetBlogId: number
): Promise< SiteTransferPreview > {
	return wpcom.req.get(
		{
			path: `/upgrades/${ purchaseId }/site-transfer/preview`,
			apiNamespace: 'wpcom/v2',
		},
		{ target_blog_id: targetBlogId }
	);
}
