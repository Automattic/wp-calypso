import { useMutation, UseMutationOptions, UseMutationResult } from 'react-query';
import {
	APIError,
	APIRemoveFavorite,
} from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';
import { wpcomJetpackLicensing as wpcomJpl } from 'calypso/lib/wp';

function mutationRemoveFavoriteSite( siteId: number ): Promise< APIRemoveFavorite > {
	return wpcomJpl.req.post( {
		method: 'DELETE',
		path: '/jetpack-agency/sites/favorite',
		apiNamespace: 'wpcom/v2',
		body: { site_id: siteId },
	} );
}

export default function useRemoveFavoriteSiteMutation< TContext = unknown >(
	site: UseMutationOptions< APIRemoveFavorite, APIError, number, TContext >
): UseMutationResult< APIRemoveFavorite, APIError, number, TContext > {
	return useMutation< APIRemoveFavorite, APIError, number, TContext >(
		mutationRemoveFavoriteSite,
		site
	);
}
