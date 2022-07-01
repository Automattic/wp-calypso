import { useMutation, UseMutationOptions, UseMutationResult } from 'react-query';
import { wpcomJetpackLicensing as wpcomJpl } from 'calypso/lib/wp';
import type {
	APIError,
	APISetFavorite,
} from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';

function mutationSetFavoriteSite( siteId: number ): Promise< APISetFavorite > {
	return wpcomJpl.req.post( {
		path: '/jetpack-agency/sites/favorite',
		apiNamespace: 'wpcom/v2',
		body: { site_id: siteId },
	} );
}

export default function useSetFavoriteSiteMutation< TContext = unknown >(
	site: UseMutationOptions< APISetFavorite, APIError, number, TContext >
): UseMutationResult< APISetFavorite, APIError, number, TContext > {
	return useMutation< APISetFavorite, APIError, number, TContext >( mutationSetFavoriteSite, site );
}
