import IntroPricingBanner from 'calypso/components/jetpack/intro-pricing-banner';
import useProductSlugs from '../hooks/use-product-slugs';
import { ProductSlugsProps } from '../types';

import './style.scss';

export const PricingBanner: React.FC< ProductSlugsProps > = ( { siteId, duration } ) => {
	const productSlugs = useProductSlugs( { siteId, duration } );

	return (
		<div className="jetpack-product-store__pricing-banner">
			<IntroPricingBanner productSlugs={ productSlugs } siteId={ siteId ?? 'none' } />
		</div>
	);
};
