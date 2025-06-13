import wpcom from 'calypso/lib/wp';

export interface Domain {
	domain: string;
	blog_id: number;
	blog_name: string;
	expiry: string;
	domain_status: {
		status: string;
	};
	wpcom_domain: boolean;
	type: string;
}

export async function fetchDomains(): Promise< Domain[] > {
	const { domains } = await wpcom.req.get( '/all-domains', {
		no_wpcom: true,
		resolve_status: true,
	} );
	return domains;
}
