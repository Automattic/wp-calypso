import { useQuery, UseQueryResult } from 'react-query';
import { useSelector } from 'react-redux';
import wpcom from 'calypso/lib/wp';
import { getActiveTheme } from 'calypso/state/themes/selectors';

export type BlockEditorSettings = {
	is_fse_eligible: boolean;
	is_fse_active: boolean;
};

export const useBlockEditorSettingsQuery = (
	siteId: number,
	userLoggedIn = false
): UseQueryResult< BlockEditorSettings > => {
	const themeId = useSelector( ( state ) => getActiveTheme( state, siteId ) );

	const queryKey = [ 'blockEditorSettings', siteId, themeId ];

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
