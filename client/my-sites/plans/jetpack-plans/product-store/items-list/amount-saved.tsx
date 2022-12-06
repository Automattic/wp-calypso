import { Gridicon } from '@automattic/components';
import { Tooltip } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { usePricingBreakdown } from '../hooks/use-pricing-breakdown';
import { RenderPrice } from '../pricing-breakdown/render-price';
import { AmountSavedProps } from '../types';

export const AmountSaved: React.FC< AmountSavedProps > = ( { product, siteId } ) => {
	const includedProductSlugs = product.productsIncluded || [];
	const translate = useTranslate();

	const { amountSaved, isFetching } = usePricingBreakdown( {
		includedProductSlugs,
		product,
		siteId,
	} );

	return amountSaved && ! isFetching ? (
		<Tooltip
			position="top left"
			text={
				<span>
					{ translate( 'For details, click on "{{moreInfo/}}"', {
						components: {
							moreInfo: (
								<span>
									{ translate( 'More about {{productName/}}', {
										components: { productName: <>{ product.shortName }</> },
									} ) }
								</span>
							),
						},
					} ) }{ ' ' }
				</span>
			}
		>
			<div className="amount-saved--tooltip-text">
				<span>
					{ translate( 'Save {{amount/}}/mo vs buying individually', {
						components: {
							amount: <RenderPrice price={ amountSaved } />,
						},
					} ) }
				</span>
				<Gridicon icon="info-outline" size={ 16 } />
			</div>
		</Tooltip>
	) : null;
};
