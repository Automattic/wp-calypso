import { useTranslate } from 'i18n-calypso';
import useItemPrice from '../use-item-price';
import { RenderPrice } from './render-price';
import { PricingBreakdownProps } from './types';
import { usePricingBreakdown } from './use-pricing-breakdown';

export const PricingBreakdown: React.FC< PricingBreakdownProps > = ( {
	includedProductSlugs,
	product,
	siteId,
} ) => {
	const translate = useTranslate();

	const { items, total } = usePricingBreakdown( { includedProductSlugs, product, siteId } );

	const { originalPrice, discountedPrice } = useItemPrice(
		siteId,
		product,
		product?.monthlyProductSlug || ''
	);

	if ( ! items.length ) {
		return null;
	}

	const bundlePrice = discountedPrice || originalPrice || 0;

	const amountSaved = Number( ( total - bundlePrice ).toFixed( 2 ) );

	return (
		<div className="product-lightbox__pricing-breakdown">
			<div className="product-lightbox__pricing-breakdown--highlight">
				{ translate( 'Save {{amount/}}/mo vs buying individually', {
					components: {
						amount: <RenderPrice price={ amountSaved } />,
					},
				} ) }
			</div>

			<div className="product-lightbox__pricing-breakdown--details">
				<ul className="product-lightbox__pricing-breakdown--details--items">
					{ items.map( ( { name, slug, renderedPrice } ) => (
						<li key={ slug }>
							<span>{ name }</span>
							{ renderedPrice }
						</li>
					) ) }
				</ul>
				<hr />
				<div className="product-lightbox__pricing-breakdown--summary">
					<span className="product-lightbox__pricing-breakdown--summary--item">
						<span>{ translate( 'Total:' ) }</span>
						<span>
							{ translate( '{{amount/}}/mo', {
								components: {
									amount: <RenderPrice price={ total } />,
								},
							} ) }
						</span>
					</span>
					<span className="product-lightbox__pricing-breakdown--summary--item">
						<span>{ translate( 'You pay:' ) }</span>
						<span>
							{ translate( '{{amount/}}/mo', {
								components: {
									amount: <RenderPrice price={ bundlePrice } />,
								},
							} ) }
						</span>
					</span>
					<span className="product-lightbox__pricing-breakdown--summary--item">
						<span>{ translate( 'Your savings:' ) }</span>
						<span>
							{ translate( '{{amount/}}/mo', {
								components: {
									amount: <RenderPrice price={ amountSaved } />,
								},
							} ) }
						</span>
					</span>
				</div>
			</div>
		</div>
	);
};
