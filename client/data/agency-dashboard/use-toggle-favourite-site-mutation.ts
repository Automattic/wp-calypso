import { isEnabled } from '@automattic/calypso-config';
import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import {
	APIError,
	APIToggleFavorite,
	ToggleFavoriteOptions,
} from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';
import wpcom, { wpcomJetpackLicensing as wpcomJpl } from 'calypso/lib/wp';

const client = isEnabled( 'a8c-for-agencies' ) ? wpcom : wpcomJpl;

function mutationToggleFavoriteSite( {
	siteId,
	isFavorite,
	agencyId,
}: ToggleFavoriteOptions ): Promise< APIToggleFavorite > {
	return client.req.post( {
		method: isFavorite ? 'DELETE' : 'POST',
		path: '/jetpack-agency/sites/favorite',
		apiNamespace: 'wpcom/v2',
		body: { site_id: siteId, agency_id: agencyId },
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
