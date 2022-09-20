import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { getCurrencyObject } from 'calypso/../packages/format-currency/src';
import TimeFrame from 'calypso/components/jetpack/card/jetpack-product-card/display-price/time-frame';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { useItemPriceCompact } from '../product-store/hooks/use-item-price-compact';
import ItemPriceMessage from '../product-store/item-price/item-price-message';
import { SelectorProduct } from '../types';
import useItemPrice from '../use-item-price';
type PaymentPlanProps = {
	isMultiSiteIncompatible?: boolean;
	siteId: number | null;
	product: SelectorProduct;
};
const PaymentPlan: React.FC< PaymentPlanProps > = ( {
	isMultiSiteIncompatible,
	siteId,
	product,
} ) => {
	const translate = useTranslate();
	const { containerRef, isCompact } = useItemPriceCompact();

	const { originalPrice, discountedPrice, isFetching } = useItemPrice(
		siteId,
		product,
		product?.monthlyProductSlug || ''
	);

	const currentPrice = discountedPrice ? discountedPrice : originalPrice;
	const currencyCode = useSelector( getCurrentUserCurrencyCode ) || 'USD';
	const priceObject = getCurrencyObject( currentPrice, currencyCode );
	const currentPriceValue = `${ priceObject?.symbol }${ priceObject?.integer }${ priceObject?.fraction }`;

	const originalPriceObject = getCurrencyObject( originalPrice, currencyCode );
	const originalPriceValue = `${ originalPriceObject?.symbol }${ originalPriceObject?.integer }${ originalPriceObject?.fraction }`;

	const labelClass = classNames(
		'product-lightbox__variants-grey-label',
		isFetching && 'is-placeholder'
	);

	const billingTerm = product.displayTerm || product.term;

	return (
		<div className="product-lightbox__variants-plan">
			{ isMultiSiteIncompatible ? (
				<ItemPriceMessage
					message={ translate( 'Not available for multisite WordPress installs' ) }
				/>
			) : (
				<>
					<p>{ translate( 'Payment plan:' ) }</p>

					<div className="product-lightbox__variants-plan-card">
						<div className={ labelClass } ref={ containerRef }>
							<span className="product-lightbox__variants-plan-card-price">
								{ currentPriceValue }
							</span>
							<div
								className={ classNames( 'product-lightbox__variants-timeframe', {
									'is-compact': isCompact,
								} ) }
							>
								<TimeFrame billingTerm={ billingTerm } />
							</div>
						</div>
						{ discountedPrice && (
							<div className={ labelClass }>
								<span className="product-lightbox__variants-plan-card-old-price">
									{ originalPriceValue }
								</span>
								{ translate( '%(percentOff)d%% off the first year', {
									args: {
										percentOff: Math.floor(
											( ( originalPrice - discountedPrice ) / originalPrice ) * 100
										),
									},
									comment: '"%%" is the literal percent symbol escaped using the other one.',
								} ) }
							</div>
						) }
					</div>
				</>
			) }
		</div>
	);
};
export default PaymentPlan;
