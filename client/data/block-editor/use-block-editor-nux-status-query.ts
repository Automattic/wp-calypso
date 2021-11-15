import { useQuery, UseQueryResult } from 'react-query';
import { useSelector } from 'react-redux';
import wpcom from 'calypso/lib/wp';
import { isJetpackSite } from 'calypso/state/sites/selectors';

export type BlockEditorNuxStatus = {
	show_welcome_guide: boolean;
};

export const useBlockEditorNuxStatusQuery = (
	siteId: string
): UseQueryResult< BlockEditorNuxStatus > => {
	const queryKey = [ 'blockEditorNuxStatus', siteId ];
	const siteIsJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );

	return useQuery< BlockEditorNuxStatus >(
		queryKey,
		() => {
			return wpcom.req.get( {
				path: `/sites/${ siteId }/block-editor/nux`,
				apiNamespace: 'wpcom/v2',
			} );
		},
		{ enabled: !! siteId && ! siteIsJetpack }
	);
};
