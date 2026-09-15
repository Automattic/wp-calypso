import { useMutation, useQueryClient } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

export default function useUpdateSiteThemes() {
	const queryClient = useQueryClient();

	return useMutation( {
		mutationFn: ( { siteId, themes }: { siteId: number; themes: string[] } ) =>
			wpcom.req.post( `/sites/${ siteId }/themes`, {
				action: 'update',
				themes,
			} ),
		onSettled: ( _data, _error, { siteId } ) => {
			queryClient.invalidateQueries( { queryKey: [ 'a4a-site-themes', siteId ] } );
		},
	} );
}
