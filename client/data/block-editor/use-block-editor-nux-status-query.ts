import { useQuery, UseQueryResult } from 'react-query';
import wpcom from 'calypso/lib/wp';

export type BlockEditorNuxStatus = {
	show_welcome_guide: boolean;
};

export const useBlockEditorNuxStatusQuery = (
	siteId: string
): UseQueryResult< BlockEditorNuxStatus > => {
	const queryKey = [ 'blockEditorNuxStatus', siteId ];

	return useQuery< BlockEditorNuxStatus >(
		queryKey,
		() => {
			return wpcom.req.get( {
				path: `/sites/${ siteId }/block-editor/nux`,
				apiNamespace: 'wpcom/v2',
			} );
		},
		{ enabled: !! siteId }
	);
};
