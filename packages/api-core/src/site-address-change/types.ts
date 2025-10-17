export enum FreeSiteAddressType {
	MANAGED = 'managed',
	BLOG = 'blog',
}

export type ValidateSiteAddressData = {
	siteId: number;
	blogname: string;
	siteAddressType: FreeSiteAddressType;
	domainSuffix: string;
};

export type ChangeSiteAddressData = {
	siteId: number;
	blogname: string;
	siteAddressType: FreeSiteAddressType;
	domainSuffix: string;
	oldDomain: string;
	discard?: boolean;
	requireVerifiedEmail?: boolean;
};
