import { siteQueryFilter } from '@automattic/api-queries';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useDispatch } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';
import { useCallback } from 'react';
import { purchasesRoute } from '../../../app/router/me';
import { siteRoute } from '../../../app/router/sites';
import type { Purchase } from '@automattic/api-core';

export function usePostRemovalNavigation( purchase: Purchase ) {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const { createSuccessNotice } = useDispatch( noticesStore );

	const navigateAfterRemoval = useCallback(
		( successMessage: string ) => {
			createSuccessNotice( successMessage, { type: 'snackbar' } );
			if ( purchase.site_slug && ! purchase.is_attached_to_holding_site ) {
				navigate( { to: siteRoute.fullPath, params: { siteSlug: purchase.site_slug } } );
				return;
			}
			navigate( { to: purchasesRoute.to } );
		},
		[ purchase, navigate, createSuccessNotice ]
	);

	// The removal mutations only invalidate the purchases list, so the site the
	// product belonged to keeps serving a stale plan (and features/products).
	// Refresh the Site record and its site-scoped caches so the destination —
	// most importantly the site page — reflects the removal. Mirrors the
	// invalidation siteDeleteMutation does.
	const invalidateSiteAfterRemoval = useCallback( () => {
		if ( ! purchase.blog_id || purchase.is_attached_to_holding_site ) {
			return;
		}
		queryClient.invalidateQueries( siteQueryFilter( purchase.blog_id ) );
		queryClient.invalidateQueries( { queryKey: [ 'site', purchase.blog_id ] } );
	}, [ queryClient, purchase.blog_id, purchase.is_attached_to_holding_site ] );

	return { navigateAfterRemoval, invalidateSiteAfterRemoval };
}
