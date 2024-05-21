import wpcom from 'calypso/lib/wp';

type WpcomRegisteredStatus = {
	status: string;
	mappable: string;
	other_site_domain?: string;
	other_site_domain_only?: boolean;
};

type NonWpcomRegisteredStatus = {
	status: null;
};

type WpcomRegistrationStatus = WpcomRegisteredStatus | NonWpcomRegisteredStatus;

export function getWpcomRegistrationStatus(
	domainName: string,
	blogId: number
): Promise< WpcomRegisteredStatus | null > {
	return wpcom.req
		.get( `/domains/${ encodeURIComponent( domainName ) }/get-wpcom-registration-status`, {
			blog_id: blogId,
			apiVersion: '1.3',
		} )
		.then( ( data: WpcomRegistrationStatus ) => ( data.status === null ? null : data ) );
}
