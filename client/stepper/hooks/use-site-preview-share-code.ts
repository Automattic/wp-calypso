import { isWpComBusinessPlan, isWpComEcommercePlan } from '@automattic/calypso-products';
import { useEffect } from 'react';
import { useCreateSitePreviewLink } from 'calypso/components/site-preview-links/use-create-site-preview-link';
import { useSitePreviewLinks } from 'calypso/components/site-preview-links/use-site-preview-links';
import { useSite } from './use-site';

export function useSitePreviewShareCode() {
	const site = useSite();

	const isBusinessPlan = site?.plan?.product_slug
		? isWpComBusinessPlan( site?.plan?.product_slug )
		: false;
	const isEcommercePlan = site?.plan?.product_slug
		? isWpComEcommercePlan( site?.plan?.product_slug )
		: false;

	const usePreviewSiteLinksQueryEnabled =
		site?.is_coming_soon && ( isBusinessPlan || isEcommercePlan ) && site?.is_wpcom_atomic;

	// Retrieves site preview share code if it exists
	const { data: previewLinks, isInitialLoading: isPreviewLinksLoading } = useSitePreviewLinks( {
		siteId: Number( site?.ID ),
		isEnabled: usePreviewSiteLinksQueryEnabled ?? false,
	} );

	// Provides createLink() function used to generate a new site preview share code
	const { createLink, isPending: isCreatingSitePreviewLinks } = useCreateSitePreviewLink( {
		siteId: Number( site?.ID ),
	} );

	// Generate preview link for site on business or ecommerce plan
	// Preview links are only available on these two plans
	useEffect( () => {
		if ( previewLinks && Array.isArray( previewLinks ) && previewLinks.length === 0 ) {
			if ( isBusinessPlan || isEcommercePlan ) {
				createLink();
			}
		}
	}, [ previewLinks, createLink, isBusinessPlan, isEcommercePlan ] );

	const shareCode = previewLinks?.[ 0 ]?.code;

	return {
		shareCode,
		isPreviewLinksLoading,
		isCreatingSitePreviewLinks,
	};
}
