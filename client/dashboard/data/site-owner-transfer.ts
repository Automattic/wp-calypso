import wpcom from 'calypso/lib/wp';

export interface SiteOwnerTransferConfirmation {
	transfer: boolean;
	email_sent: boolean;
	new_owner_email: string;
}

export async function startSiteOwnerTransfer( siteId: number, data: { new_site_owner: string } ) {
	return wpcom.req.post(
		{
			path: `/sites/${ siteId }/site-owner-transfer`,
			apiNamespace: 'wpcom/v2',
		},
		{
			calypso_origin: window.location.origin,
		},
		{
			// We need to update the check when modifying the base path for v2
			context: window.location.pathname.startsWith( '/v2' ) ? 'dashboard_v2' : undefined,
			...data,
		}
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
