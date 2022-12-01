import { Button, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { usePricingBreakdown } from '../hooks/use-pricing-breakdown';
import { RenderPrice } from '../pricing-breakdown/render-price';
import { AmountSavedProps } from '../types';

export const AmountSaved: React.FC< AmountSavedProps > = ( { product, siteId, onClick } ) => {
	const includedProductSlugs = product.productsIncluded || [];
	const translate = useTranslate();

	const { amountSaved } = usePricingBreakdown( {
		includedProductSlugs,
		product,
		siteId,
	} );

	return amountSaved ? (
		<Button onClick={ onClick } href={ `#${ product.productSlug }` } plain>
			<span>
				{ translate( 'Save {{amount/}}/mo vs buying individually', {
					components: {
						amount: <RenderPrice price={ amountSaved } />,
					},
				} ) }
			</span>
			<Gridicon icon="info-outline" size={ 16 } />
		</Button>
	) : null;
};
