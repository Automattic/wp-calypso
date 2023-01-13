import { useMutation } from 'react-query';
import wpcom from 'calypso/lib/wp';
import { buildDIFMWebsiteContentRequestDTO } from 'calypso/state/difm/assemblers';
import type { WebsiteContent } from 'calypso/state/signup/steps/website-content/types';
import type { SiteId } from 'calypso/types';

export function useSaveWebsiteContentMutation(
	siteId: SiteId | null,
	websiteContent: WebsiteContent
) {
	return useMutation< WebsiteContent, Error, void >( {
		mutationFn: () => {
			const websiteContentRequestDTO = buildDIFMWebsiteContentRequestDTO( websiteContent );
			return wpcom.req.put( {
				method: 'PUT',
				path: `/sites/${ siteId }/do-it-for-me/website-content`,
				apiNamespace: 'wpcom/v2',
				body: websiteContentRequestDTO,
			} );
		},
	} );
}
