import wpcom from 'calypso/lib/wp';

export enum DomainTypes {
	MAPPED = 'mapping',
	REGISTERED = 'registered',
	SITE_REDIRECT = 'redirect',
	WPCOM = 'wpcom',
	TRANSFER = 'transfer',
}

export interface Domain {
	primary_domain: boolean;
	domain: string;
	blog_id: number;
	blog_name: string;
	expiry: string | false;
	domain_status?: {
		status: string;
	};
	wpcom_domain: boolean;
	is_wpcom_staging_domain: boolean;
	type: `${ DomainTypes }`;
	site_slug: string;
}

export async function fetchDomains(): Promise< Domain[] > {
	const { domains } = await wpcom.req.get( '/all-domains', {
		no_wpcom: true,
		resolve_status: true,
	} );
	return domains;
}
