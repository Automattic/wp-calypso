import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import InfoPopover from 'calypso/components/info-popover';
import { usePricingBreakdown } from '../hooks/use-pricing-breakdown';
import { RenderPrice } from '../pricing-breakdown/render-price';
import { AmountSavedProps } from '../types';

export const AmountSaved: React.FC< AmountSavedProps > = ( {
	product,
	siteId,
	onClickMoreInfo,
} ) => {
	const includedProductSlugs = product.productsIncluded || [];
	const translate = useTranslate();

	const { amountSaved, isFetching, total } = usePricingBreakdown( {
		includedProductSlugs,
		product,
		siteId,
	} );

	return amountSaved && ! isFetching ? (
		<div className="amount-saved--text">
			<span>
				{ translate( 'Save {{amount/}}/mo vs buying individually', {
					components: {
						amount: <RenderPrice price={ amountSaved } />,
					},
				} ) }
			</span>
			<InfoPopover
				position="right"
				screenReaderText={ translate( 'Learn more' ) }
				className="amount-saved--popover"
			>
				{ translate( 'If purchased individually, all products would cost {{amount/}}/month.', {
					components: {
						amount: <RenderPrice price={ total } />,
					},
				} ) }
				<hr />
				<Button
					className="more-info-link"
					onClick={ onClickMoreInfo }
					href={ `#${ product.productSlug }` }
					plain
				>
					{ translate( 'More about bundle savings' ) }
				</Button>
			</InfoPopover>
		</div>
	) : null;
};
