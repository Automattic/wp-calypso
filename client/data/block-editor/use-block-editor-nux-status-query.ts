import { useQuery, UseQueryResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { isJetpackSite } from 'calypso/state/sites/selectors';

export type BlockEditorNuxStatus = {
	show_welcome_guide: boolean;
};

export const useBlockEditorNuxStatusQuery = (
	siteId: number
): UseQueryResult< BlockEditorNuxStatus > => {
	const queryKey = [ 'blockEditorNuxStatus', siteId ];
	const siteIsJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );

	return useQuery< BlockEditorNuxStatus >( {
		queryKey,
		queryFn: () => {
			return wpcom.req.get( {
				path: `/sites/${ siteId }/block-editor/nux`,
				apiNamespace: 'wpcom/v2',
			} );
		},
		enabled: !! siteId && ! siteIsJetpack,
	} );
};
