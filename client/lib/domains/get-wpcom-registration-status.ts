import wpcom from 'calypso/lib/wp';

type WpcomRegistrationStatus = {
	status: string;
	mappable: string;
	other_site_domain?: string;
};

export function getWpcomRegistrationStatus(
	domainName: string,
	blogId: number
): Promise< WpcomRegistrationStatus > {
	return wpcom.req.get(
		`/domains/${ encodeURIComponent( domainName ) }/get-wpcom-registration-status`,
		{
			blog_id: blogId,
			apiVersion: '1.3',
		}
	);
}
