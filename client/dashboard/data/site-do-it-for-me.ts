import wpcom from 'calypso/lib/wp';

export interface DifmWebsiteContentResponse {
	is_website_content_submitted: boolean;
}

export function fetchDifmWebsiteContent( siteId: number ): Promise< DifmWebsiteContentResponse > {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/do-it-for-me/website-content`,
		apiNamespace: 'wpcom/v2',
	} );
}
