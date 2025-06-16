import wpcom from 'calypso/lib/wp';

export interface SiteDomain {
	domain: string;
	blog_id: number;
	blog_name: string;
	expiry: string;
	wpcom_domain: boolean;
	type: string;
	primary_domain: boolean;
	is_wpcom_staging_domain: boolean;
}

export async function fetchSiteDomains( siteId: number ): Promise< SiteDomain[] > {
	const { domains } = await wpcom.req.get( {
		path: `/sites/${ siteId }/domains`,
		apiVersion: '1.2',
	} );

	return domains;
}
