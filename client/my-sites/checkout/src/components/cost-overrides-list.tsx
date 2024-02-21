import { FormStatus, useFormStatus, Button } from '@automattic/composite-checkout';
import formatCurrency from '@automattic/format-currency';
import {
	type ResponseCart,
	type RemoveCouponFromCart,
	type ResponseCartProduct,
	useShoppingCart,
} from '@automattic/shopping-cart';
import {
	LineItemBillingInterval,
	doesIntroductoryOfferHaveDifferentTermLengthThanProduct,
	hasCheckoutVersion,
} from '@automattic/wpcom-checkout';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import useCartKey from '../../use-cart-key';
import type { Theme } from '@automattic/composite-checkout';
import type {
	CostOverrideForDisplay,
	LineItemCostOverrideForDisplay,
} from '@automattic/wpcom-checkout';

const CostOverridesListStyle = styled.div`
	grid-area: discounts;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	font-size: 12px;
	font-weight: 400;

	& .cost-overrides-list-item {
		display: grid;
		justify-content: space-between;
		grid-template-columns: auto auto;
		margin-top: 4px;
		gap: 0 16px;
	}

	& .cost-overrides-list-item--coupon {
		margin-top: 16px;
	}

	& .cost-overrides-list-item:nth-of-type( 1 ) {
		margin-top: 0;
	}

	& .cost-overrides-list-item__actions {
		grid-column: 1 / span 2;
		display: flex;
		justify-content: flex-end;
	}

	& .cost-overrides-list-item__actions-remove {
		color: #787c82;
	}

	& .cost-overrides-list-item__reason {
		color: #008a20;
	}

	& .cost-overrides-list-item__discount {
		white-space: nowrap;
	}
`;

const DeleteButton = styled( Button )< { theme?: Theme } >`
	width: auto;
	font-size: ${ hasCheckoutVersion( '2' ) ? '12px' : 'inherit' };
	color: ${ ( props ) => props.theme.colors.textColorLight };
`;

export function CostOverridesList( {
	costOverridesList,
	currency,
	removeCoupon,
	couponCode,
	showOnlyCoupons,
}: {
	costOverridesList: Array< CostOverrideForDisplay >;
	currency: string;
	removeCoupon?: RemoveCouponFromCart;
	couponCode: ResponseCart[ 'coupon' ];
	showOnlyCoupons?: boolean;
} ) {
	const translate = useTranslate();
	// Let's put the coupon code last because it will have its own "Remove" button.
	const nonCouponOverrides = costOverridesList.filter(
		( override ) => override.overrideCode !== 'coupon-discount'
	);
	const couponOverrides = costOverridesList.filter(
		( override ) => override.overrideCode === 'coupon-discount'
	);
	const { formStatus } = useFormStatus();
	const isDisabled = formStatus !== FormStatus.READY;
	return (
		<CostOverridesListStyle>
			{ ! showOnlyCoupons &&
				nonCouponOverrides.map( ( costOverride ) => {
					return (
						<div className="cost-overrides-list-item" key={ costOverride.humanReadableReason }>
							<span className="cost-overrides-list-item__reason">
								{ costOverride.humanReadableReason }
							</span>
							<span className="cost-overrides-list-item__discount">
								{ formatCurrency( -costOverride.discountAmount, currency, {
									isSmallestUnit: true,
								} ) }
							</span>
						</div>
					);
				} ) }
			{ ! removeCoupon &&
				couponOverrides.map( ( costOverride ) => {
					return (
						<div className="cost-overrides-list-item" key={ costOverride.humanReadableReason }>
							<span className="cost-overrides-list-item__reason">
								{ couponCode.length > 0
									? translate( 'Coupon: %(couponCode)s', { args: { couponCode } } )
									: costOverride.humanReadableReason }
							</span>
							<span className="cost-overrides-list-item__discount">
								{ formatCurrency( -costOverride.discountAmount, currency, {
									isSmallestUnit: true,
								} ) }
							</span>
						</div>
					);
				} ) }
			{ removeCoupon &&
				couponOverrides.map( ( costOverride ) => {
					return (
						<div
							className="cost-overrides-list-item cost-overrides-list-item--coupon"
							key={ costOverride.humanReadableReason }
						>
							<span className="cost-overrides-list-item__reason">
								{ couponCode.length > 0
									? translate( 'Coupon: %(couponCode)s', { args: { couponCode } } )
									: costOverride.humanReadableReason }
							</span>
							<span className="cost-overrides-list-item__discount">
								{ formatCurrency( -costOverride.discountAmount, currency, {
									isSmallestUnit: true,
								} ) }
							</span>
							<span className="cost-overrides-list-item__actions">
								<DeleteButton
									buttonType="text-button"
									disabled={ isDisabled }
									className="cost-overrides-list-item__actions-remove"
									onClick={ removeCoupon }
									aria-label={ translate( 'Remove coupon' ) }
								>
									{ translate( 'Remove' ) }
								</DeleteButton>
							</span>
						</div>
					);
				} ) }
		</CostOverridesListStyle>
	);
}

function LineItemCostOverrideIntroOfferDueDate( { product }: { product: ResponseCartProduct } ) {
	const cartKey = useCartKey();
	const { responseCart } = useShoppingCart( cartKey );
	const translate = useTranslate();
	if ( ! product.introductory_offer_terms?.enabled ) {
		return null;
	}
	if ( ! doesIntroductoryOfferHaveDifferentTermLengthThanProduct( product ) ) {
		return null;
	}
	const tosData = responseCart.terms_of_service?.find( ( tos ) => {
		if ( ! new RegExp( `product_id:${ product.product_id }` ).test( tos.key ) ) {
			return false;
		}
		if ( product.meta && ! new RegExp( `meta:${ product.meta }` ).test( tos.key ) ) {
			return false;
		}
		return true;
	} )?.args;
	const dueDate = tosData?.subscription_auto_renew_date;
	const dueAmount = tosData?.renewal_price_integer;
	const renewAmount = tosData?.regular_renewal_price_integer;
	if ( ! dueDate || ! dueAmount || ! renewAmount ) {
		return null;
	}

	return (
		<div>
			<div>
				{ translate( 'Due today: %(price)s', {
					args: {
						price: formatCurrency( product.item_subtotal_integer, product.currency, {
							isSmallestUnit: true,
							stripZeros: true,
						} ),
					},
				} ) }
			</div>
			<div>
				{ translate( 'Billed %(dueDate)s: %(price)s', {
					args: {
						dueDate: new Date( dueDate ).toLocaleDateString( undefined, {
							dateStyle: 'long',
						} ),
						price: formatCurrency( dueAmount, product.currency, {
							isSmallestUnit: true,
							stripZeros: true,
						} ),
					},
				} ) }
			</div>
			<div>
				<LineItemBillingInterval product={ product } />{ ' ' }
				<span>
					{ formatCurrency( renewAmount, product.currency, {
						isSmallestUnit: true,
						stripZeros: true,
					} ) }
				</span>
			</div>
		</div>
	);
}

function LineItemCostOverride( {
	costOverride,
	product,
}: {
	costOverride: LineItemCostOverrideForDisplay;
	product: ResponseCartProduct;
} ) {
	return (
		<div className="cost-overrides-list-item" key={ costOverride.humanReadableReason }>
			<span className="cost-overrides-list-item__reason">{ costOverride.humanReadableReason }</span>
			<span className="cost-overrides-list-item__discount">
				{ costOverride.discountAmount &&
					formatCurrency( -costOverride.discountAmount, product.currency, {
						isSmallestUnit: true,
					} ) }
			</span>
			<LineItemCostOverrideIntroOfferDueDate product={ product } />
		</div>
	);
}

export function LineItemCostOverrides( {
	costOverridesList,
	product,
}: {
	costOverridesList: LineItemCostOverrideForDisplay[];
	product: ResponseCartProduct;
} ) {
	return (
		<CostOverridesListStyle>
			{ costOverridesList.map( ( costOverride ) => (
				<LineItemCostOverride
					product={ product }
					costOverride={ costOverride }
					key={ costOverride.humanReadableReason }
				/>
			) ) }
		</CostOverridesListStyle>
	);
}
