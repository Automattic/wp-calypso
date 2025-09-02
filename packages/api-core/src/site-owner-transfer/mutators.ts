import { wpcom } from '../wpcom-fetcher';
import type { SiteOwnerTransferContext, SiteOwnerTransferConfirmation } from './types';

export async function startSiteOwnerTransfer(
	siteId: number,
	data: { new_site_owner: string; context?: SiteOwnerTransferContext }
) {
	return wpcom.req.post(
		{
			path: `/sites/${ siteId }/site-owner-transfer`,
			apiNamespace: 'wpcom/v2',
		},
		{
			calypso_origin: window.location.origin,
		},
		data
	);
}

export async function checkSiteOwnerTransferEligibility(
	siteId: number,
	data: { new_site_owner: string }
) {
	return wpcom.req.post(
		{
			path: `/sites/${ siteId }/site-owner-transfer/eligibility`,
			apiNamespace: 'wpcom/v2',
		},
		data
	);
}

export async function confirmSiteOwnerTransfer(
	siteId: number,
	data: { hash: string }
): Promise< SiteOwnerTransferConfirmation > {
	return wpcom.req.post(
		{
			path: `/sites/${ siteId }/site-owner-transfer/confirm`,
			apiNamespace: 'wpcom/v2',
		},
		data
	);
}
