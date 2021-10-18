import { useQuery, UseQueryResult } from 'react-query';
import wpcom from 'calypso/lib/wp';

export type BlockEditorSettings = {
	is_fse_eligible: boolean;
};

export const useBlockEditorSettingsQuery = (
	siteId: string,
	userLoggedIn = false
): UseQueryResult< BlockEditorSettings > => {
	const queryKey = [ 'blockEditorSettings', siteId ];

	return useQuery< BlockEditorSettings >(
		queryKey,
		() => {
			return wpcom.req.get( {
				path: `/sites/${ siteId }/block-editor`,
				apiNamespace: 'wpcom/v2',
			} );
		},
		{ enabled: userLoggedIn && !! siteId }
	);
};
