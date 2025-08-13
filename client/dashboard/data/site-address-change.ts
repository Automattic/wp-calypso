import wpcom from 'calypso/lib/wp';

export const FreeSiteAddressType = {
	MANAGED: 'managed',
	BLOG: 'blog',
};

export type ValidateSiteAddressData = {
	siteId: number;
	blogname: string;
	siteAddressType: ( typeof FreeSiteAddressType )[ keyof typeof FreeSiteAddressType ];
	domainSuffix: string;
};

export async function validateSiteAddress( {
	siteId,
	blogname,
	siteAddressType,
	domainSuffix,
}: ValidateSiteAddressData ) {
	return wpcom.req.post(
		{
			path: `/sites/${ siteId }/site-address-change/validate`,
			apiNamespace: 'wpcom/v2',
		},
		{
			blogname,
			domain: domainSuffix,
			type: siteAddressType,
		}
	);
}

export type ChangeSiteAddressData = {
	siteId: number;
	blogname: string;
	siteAddressType: ( typeof FreeSiteAddressType )[ keyof typeof FreeSiteAddressType ];
	domainSuffix: string;
	oldDomain: string;
	discard?: boolean;
	requireVerifiedEmail?: boolean;
};

export async function changeSiteAddress( {
	siteId,
	blogname,
	siteAddressType,
	domainSuffix,
	oldDomain,
	discard = true,
	requireVerifiedEmail = true,
}: ChangeSiteAddressData ) {
	const nonce = await wpcom.req.get( {
		path: `/sites/${ siteId }/site-address-change/nonce`,
		apiNamespace: 'wpcom/v2',
	} );

	return wpcom.req.post(
		{
			path: `/sites/${ siteId }/site-address-change`,
			apiNamespace: 'wpcom/v2',
		},
		{
			blogname,
			domain: domainSuffix,
			type: siteAddressType,
			old_domain: oldDomain,
			discard,
			require_verified_email: requireVerifiedEmail,
			nonce,
		}
	);
}
