import { useTranslate } from 'i18n-calypso';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { FeaturedItemCard } from './featured-item-card';
import { HeroImage } from './hero-image';
import { useBundlesToDisplay } from './hooks/use-bundles-to-display';
import { useCreateCheckout } from './hooks/use-create-checkout';
import { MostPopular } from './most-popular';
import { SeeAllFeatures } from './see-all-features';
import type { BundlesListProps } from './types';

export const BundlesList: React.FC< BundlesListProps > = ( {
	createCheckoutURL,
	duration,
	onClickPurchase,
	siteId,
} ) => {
	const [ popularItems ] = useBundlesToDisplay( { duration, siteId } );
	const translate = useTranslate();

	const { getCheckoutURL, getOnClickPurchase } = useCreateCheckout( {
		createCheckoutURL,
		onClickPurchase,
		duration,
		siteId,
	} );

	const mostPopularItems = popularItems.map( ( item ) => {
		return (
			<div key={ item.productSlug }>
				<FeaturedItemCard
					hero={ <HeroImage item={ item } /> }
					item={ item }
					siteId={ siteId }
					onClickMore={ () => {
						recordTracksEvent( 'calypso_product_more_about_product_click', {
							product: item.productSlug,
						} );
						// TODO: Open modal
					} }
					onClickPurchase={ getOnClickPurchase( item ) }
					checkoutURL={ getCheckoutURL( item ) }
				/>
				{ /* Bundle list goes here */ }
			</div>
		);
	} );

	return (
		<div className="jetpack-product-store__bundles-list">
			<MostPopular heading={ translate( 'Most popular bundles' ) } items={ mostPopularItems } />
			<SeeAllFeatures />
		</div>
	);
};
