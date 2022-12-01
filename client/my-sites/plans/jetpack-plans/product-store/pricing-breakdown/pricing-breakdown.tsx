import { useTranslate } from 'i18n-calypso';
import { usePricingBreakdown } from '../hooks/use-pricing-breakdown';
import { PricingBreakdownProps } from '../types';
import { RenderPrice } from './render-price';

export const PricingBreakdown: React.FC< PricingBreakdownProps > = ( {
	includedProductSlugs,
	product,
	showBreakdownHeading,
	siteId,
} ) => {
	const translate = useTranslate();

	const { items, total, amountSaved, bundlePrice } = usePricingBreakdown( {
		includedProductSlugs,
		product,
		siteId,
	} );

	if ( ! items.length ) {
		return null;
	}

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
				{ showBreakdownHeading ? (
					<div className="product-lightbox__pricing-breakdown--heading">
						{ translate( 'Price breakdown:' ) }
					</div>
				) : null }
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
