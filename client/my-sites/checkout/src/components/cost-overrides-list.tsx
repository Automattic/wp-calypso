import { FormStatus, useFormStatus, Button } from '@automattic/composite-checkout';
import formatCurrency from '@automattic/format-currency';
import { hasCheckoutVersion } from '@automattic/wpcom-checkout';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import type { Theme } from '@automattic/composite-checkout';
import type { ResponseCart, RemoveCouponFromCart } from '@automattic/shopping-cart';

const CostOverridesListStyle = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	font-size: 12px;
	font-weight: 400;
	margin-top: 10px;
	margin-bottom: 20px;

	& .cost-overrides-list-item {
		display: grid;
		justify-content: space-between;
		grid-template-columns: auto auto;
		margin-top: 4px;
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
	font-size: ${ hasCheckoutVersion( '2' ) ? '14px' : 'inherit' };
	color: ${ ( props ) => props.theme.colors.textColorLight };
`;

export interface CostOverrideForDisplay {
	humanReadableReason: string;
	overrideCode: string;
	discountAmount: number;
}

export function filterAndGroupCostOverridesForDisplay(
	responseCart: ResponseCart
): CostOverrideForDisplay[] {
	// Collect cost overrides from each line item and group them by type so we
	// can show them all together after the line item list.
	const costOverridesGrouped = responseCart.products.reduce<
		Record< string, CostOverrideForDisplay >
	>( ( grouped, product ) => {
		const costOverrides = product?.cost_overrides;
		if ( ! costOverrides ) {
			return grouped;
		}

		costOverrides.forEach( ( costOverride ) => {
			if ( costOverride.does_override_original_cost ) {
				// We won't display original cost overrides since they are
				// included in the original cost that's being displayed. They
				// are not discounts.
				return;
			}
			const discountAmount = grouped[ costOverride.override_code ]?.discountAmount ?? 0;
			const newDiscountAmount =
				costOverride.old_subtotal_integer - costOverride.new_subtotal_integer;
			grouped[ costOverride.override_code ] = {
				humanReadableReason: costOverride.human_readable_reason,
				overrideCode: costOverride.override_code,
				discountAmount: discountAmount + newDiscountAmount,
			};
		} );
		return grouped;
	}, {} );
	return Object.values( costOverridesGrouped );
}

export function CostOverridesList( {
	costOverridesList,
	currency,
	removeCoupon,
	couponCode,
	creditsInteger,
}: {
	costOverridesList: Array< CostOverrideForDisplay >;
	currency: string;
	removeCoupon: RemoveCouponFromCart;
	couponCode: ResponseCart[ 'coupon' ];
	creditsInteger: number;
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
			{ nonCouponOverrides.map( ( costOverride ) => {
				return (
					<div className="cost-overrides-list-item" key={ costOverride.humanReadableReason }>
						<span className="cost-overrides-list-item__reason">
							{ costOverride.humanReadableReason }
						</span>
						<span className="cost-overrides-list-item__discount">
							{ formatCurrency( -costOverride.discountAmount, currency, { isSmallestUnit: true } ) }
						</span>
					</div>
				);
			} ) }
			{ creditsInteger > 0 && (
				<div className="cost-overrides-list-item" key="credits-override">
					<span className="cost-overrides-list-item__reason">{ translate( 'Credits' ) }</span>
					<span className="cost-overrides-list-item__discount">
						{ formatCurrency( -creditsInteger, currency, { isSmallestUnit: true } ) }
					</span>
				</div>
			) }
			{ couponOverrides.map( ( costOverride ) => {
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
							{ formatCurrency( -costOverride.discountAmount, currency, { isSmallestUnit: true } ) }
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
