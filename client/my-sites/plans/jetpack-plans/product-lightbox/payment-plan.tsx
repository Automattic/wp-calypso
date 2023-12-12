import formatCurrency from '@automattic/format-currency';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import TimeFrame from 'calypso/components/jetpack/card/jetpack-product-card/display-price/time-frame';
import PlanPrice from 'calypso/my-sites/plan-price';
import { useSelector } from 'calypso/state';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { useItemPriceCompact } from '../product-store/hooks/use-item-price-compact';
import ItemPriceMessage from '../product-store/item-price/item-price-message';
import { SelectorProduct } from '../types';
import useItemPrice from '../use-item-price';
type PaymentPlanProps = {
	isMultiSiteIncompatible?: boolean;
	siteId: number | null;
	product: SelectorProduct;
	showPlansOneBelowTheOther?: boolean;
	isActive?: boolean;
};
const PaymentPlan: React.FC< PaymentPlanProps > = ( {
	isMultiSiteIncompatible,
	siteId,
	product,
	showPlansOneBelowTheOther = false,
	isActive = true,
} ) => {
	const translate = useTranslate();
	const { containerRef, isCompact } = useItemPriceCompact();

	const { originalPrice, discountedPrice, discountedPriceDuration, isFetching } = useItemPrice(
		siteId,
		product,
		product?.monthlyProductSlug || ''
	);

	const currentPrice = discountedPrice ? discountedPrice : originalPrice;
	const currencyCode = useSelector( getCurrentUserCurrencyCode ) || 'USD';

	const labelClass = classNames(
		'product-lightbox__variants-grey-label',
		isFetching && 'is-placeholder'
	);

	const billingTerm = product.displayTerm || product.term;

	const getDiscountedLabel = useCallback( () => {
		if ( ! discountedPrice ) {
			return;
		}
		const translateArgs = {
			args: {
				percentOff: Math.floor( ( ( originalPrice - discountedPrice ) / originalPrice ) * 100 ),
			},
			comment: '"%%" is the literal percent symbol escaped using the other one.',
		};
		return 1 === discountedPriceDuration
			? translate( '%(percentOff)d%% off the first month', translateArgs )
			: translate( '%(percentOff)d%% off the first year', translateArgs );
	}, [ discountedPriceDuration, originalPrice, discountedPrice, translate ] );

	return (
		<div className="product-lightbox__variants-plan">
			{ isMultiSiteIncompatible ? (
				<ItemPriceMessage
					message={ translate( 'Not available for multisite WordPress installs' ) }
				/>
			) : (
				<>
					{ ! showPlansOneBelowTheOther && <p>{ translate( 'Payment plan:' ) }</p> }

					<div
						className={ classNames(
							'product-lightbox__variants-plan-card',
							! isActive && 'product-lightbox__variants-plan-card inactive'
						) }
					>
						<div className={ labelClass } ref={ containerRef }>
							<span className="product-lightbox__variants-plan-card-price">
								<PlanPrice rawPrice={ currentPrice } currencyCode={ currencyCode } />
							</span>
							<div
								className={ classNames( 'product-lightbox__variants-timeframe', {
									'is-compact': isCompact,
								} ) }
							>
								<TimeFrame
									billingTerm={ billingTerm }
									discountedPriceDuration={ discountedPriceDuration }
									formattedOriginalPrice={ formatCurrency( originalPrice, currencyCode, {
										stripZeros: true,
									} ) }
									isDiscounted={ !! discountedPrice }
								/>
							</div>
						</div>
						{ discountedPrice && (
							<div className={ labelClass }>
								<span className="product-lightbox__variants-plan-card-old-price">
									<PlanPrice original rawPrice={ originalPrice } currencyCode={ currencyCode } />
								</span>
								{ getDiscountedLabel() }
							</div>
						) }
					</div>
				</>
			) }
		</div>
	);
};
export default PaymentPlan;
