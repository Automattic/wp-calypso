import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import {
	APIError,
	APIToggleFavorite,
	ToggleFavoriteOptions,
} from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';
import { wpcomJetpackLicensing as wpcomJpl } from 'calypso/lib/wp';

function mutationToggleFavoriteSite( {
	siteId,
	isFavorite,
}: ToggleFavoriteOptions ): Promise< APIToggleFavorite > {
	return wpcomJpl.req.post( {
		method: isFavorite ? 'DELETE' : 'POST',
		path: '/jetpack-agency/sites/favorite',
		apiNamespace: 'wpcom/v2',
		body: { site_id: siteId },
	} );
}

export default function useToggleFavoriteSiteMutation< TContext = unknown >(
	options: UseMutationOptions< APIToggleFavorite, APIError, ToggleFavoriteOptions, TContext >
): UseMutationResult< APIToggleFavorite, APIError, ToggleFavoriteOptions, TContext > {
	return useMutation< APIToggleFavorite, APIError, ToggleFavoriteOptions, TContext >( {
		...options,
		mutationFn: mutationToggleFavoriteSite,
	} );
}
