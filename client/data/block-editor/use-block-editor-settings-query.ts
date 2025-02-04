import { useQuery, UseQueryResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveTheme } from 'calypso/state/themes/selectors';

type HomeTemplateSettings = {
	postType: string | null;
	postId: number | null;
};

// is_fse_active property has been deprecated. Refer to the withIsFSEActive HOC to use the isFSEActive to determine if a theme is FSE enabled.
// is_fse_eligible property has been deprecated because all sites are now FSE eligible.
export type BlockEditorSettings = {
	home_template: HomeTemplateSettings;
};

export const useBlockEditorSettingsQuery = (
	siteId: number,
	isEnabled = false
): UseQueryResult< BlockEditorSettings > => {
	const themeId = useSelector( ( state ) => getActiveTheme( state, siteId ) );

	const queryKey = [ 'blockEditorSettings', siteId, themeId ];

	return useQuery< BlockEditorSettings >( {
		queryKey,
		queryFn: () => {
			return wpcom.req.get( {
				path: `/sites/${ siteId }/block-editor`,
				apiNamespace: 'wpcom/v2',
			} );
		},
		enabled: isEnabled && !! siteId,
	} );
};
