import { useQuery, UseQueryResult } from 'react-query';
import wpcom from 'calypso/lib/wp';

export type WhatsNewResult = {
	has_seen_whats_new_modal: boolean;
};

export const useHasSeenWhatsNewModalQuery = (
	siteId: number
): UseQueryResult< WhatsNewResult > => {
	const queryKey = [ 'hasSeenWhatsNewModal', siteId ];

	return useQuery< WhatsNewResult >( queryKey, () => {
		return wpcom.req.get( {
			path: `/sites/${ siteId }/block-editor/has-seen-whats-new-modal`,
			apiNamespace: 'wpcom/v2',
		} );
	} );
};
