import { JETPACK_SOCIAL_PRODUCTS } from '@automattic/calypso-products';
import { useMemo } from 'react';
import IntroPricingBanner from 'calypso/components/jetpack/intro-pricing-banner';
import useProductSlugs from '../hooks/use-product-slugs';
import { ProductSlugsProps } from '../types';

import './style.scss';

export const PricingBanner: React.FC< ProductSlugsProps > = ( { siteId, duration } ) => {
	const productSlugs = useProductSlugs( { siteId, duration } );

	// TO-DO: Once Jetpack Social pricing tiers and the introductory discount have been worked on, filtering should be removed.
	const filteredProductSlugs = useMemo(
		() =>
			productSlugs.filter(
				( productSlug ) =>
					! ( JETPACK_SOCIAL_PRODUCTS as ReadonlyArray< string > ).includes( productSlug )
			),
		[ productSlugs ]
	);

	return (
		<div className="jetpack-product-store__pricing-banner">
			<IntroPricingBanner productSlugs={ filteredProductSlugs } siteId={ siteId ?? 'none' } />
		</div>
	);
};
