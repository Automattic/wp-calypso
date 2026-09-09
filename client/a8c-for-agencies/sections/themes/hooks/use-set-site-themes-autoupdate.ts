import { useMutation, useQueryClient } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

export default function useSetSiteThemesAutoupdate() {
	const queryClient = useQueryClient();

	return useMutation( {
		mutationFn: ( {
			siteId,
			themes,
			autoupdate,
		}: {
			siteId: number;
			themes: string[];
			autoupdate: boolean;
		} ) =>
			wpcom.req.post( `/sites/${ siteId }/themes`, {
				autoupdate,
				themes,
			} ),
		onSettled: ( _data, _error, { siteId } ) => {
			queryClient.invalidateQueries( { queryKey: [ 'a4a-site-themes', siteId ] } );
		},
	} );
}
