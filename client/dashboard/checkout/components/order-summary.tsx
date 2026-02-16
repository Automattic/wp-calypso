import { formatCurrency } from '@automattic/number-formatters';
import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Card, CardBody, CardDivider } from '../../components/card';
import type { ResponseCart, ResponseCartProduct } from '@automattic/shopping-cart';

interface CostOverride {
	humanReadableReason: string;
	discountAmount: number;
	overrideCode: string;
}

/**
 * Returns user-visible cost overrides for a product, filtering out overrides
 * that are baked into the original cost or displayed separately (e.g. coupons).
 */
function getVisibleCostOverrides( product: ResponseCartProduct ): CostOverride[] {
	return ( product.cost_overrides ?? [] )
		.filter( ( override ) => ! override.does_override_original_cost )
		.filter( ( override ) => override.override_code !== 'coupon-discount' )
		.map( ( override ) => ( {
			humanReadableReason: override.human_readable_reason,
			discountAmount: override.old_subtotal_integer - override.new_subtotal_integer,
			overrideCode: override.override_code,
		} ) );
}

function ProductLineItem( { product }: { product: ResponseCartProduct } ) {
	const costOverrides = getVisibleCostOverrides( product );
	return (
		<VStack spacing={ 1 }>
			<HStack justify="space-between" spacing={ 2 } alignment="flex-start">
				<VStack spacing={ 0 } style={ { flex: '1 1 auto' } }>
					<Text weight={ 500 }>{ product.product_name }</Text>
					{ product.meta && (
						<Text style={ { color: '#646970', fontSize: '0.875rem' } }>{ product.meta }</Text>
					) }
				</VStack>
				<Text style={ { flexShrink: 0 } }>
					{ formatCurrency( product.item_original_subtotal_integer, product.currency, {
						isSmallestUnit: true,
						stripZeros: true,
					} ) }
				</Text>
			</HStack>
			{ costOverrides.length > 0 && (
				<VStack spacing={ 0 }>
					{ costOverrides.map( ( override ) => (
						<HStack key={ override.overrideCode } justify="space-between" spacing={ 2 }>
							<Text style={ { fontSize: '0.75rem', color: '#069e08' } }>
								{ override.humanReadableReason }
							</Text>
							{ override.discountAmount !== 0 && (
								<Text
									style={ {
										fontSize: '0.75rem',
										color: override.discountAmount > 0 ? '#069e08' : undefined,
										fontWeight: 500,
										whiteSpace: 'nowrap',
									} }
								>
									{ formatCurrency( -override.discountAmount, product.currency, {
										isSmallestUnit: true,
										stripZeros: true,
										signForPositive: override.discountAmount < 0,
									} ) }
								</Text>
							) }
						</HStack>
					) ) }
				</VStack>
			) }
		</VStack>
	);
}

function CouponLineItem( { responseCart }: { responseCart: ResponseCart } ) {
	if ( ! responseCart.coupon || ! responseCart.coupon_savings_total_integer ) {
		return null;
	}

	return (
		<HStack justify="space-between" spacing={ 2 } style={ { paddingBlockStart: '0.25rem' } }>
			<Text style={ { fontSize: '0.75rem', color: '#069e08' } }>
				{ __( 'Coupon:' ) } <strong>{ responseCart.coupon }</strong>
			</Text>
			<Text
				style={ { fontSize: '0.75rem', color: '#069e08', fontWeight: 500, whiteSpace: 'nowrap' } }
			>
				{ formatCurrency( -responseCart.coupon_savings_total_integer, responseCart.currency, {
					isSmallestUnit: true,
					stripZeros: true,
				} ) }
			</Text>
		</HStack>
	);
}

export function OrderSummary( { responseCart }: { responseCart: ResponseCart } ) {
	const hasTax = responseCart.total_tax_integer > 0;
	const hasCredits = responseCart.credits_integer > 0 && responseCart.sub_total_integer > 0;

	// Compare the sum of each product's highest price against the cart subtotal to
	// determine whether a discount badge should appear on the subtotal row.
	const subtotalBeforeDiscounts = responseCart.products.reduce( ( sum, product ) => {
		return sum + Math.max( product.item_subtotal_integer, product.item_original_subtotal_integer );
	}, 0 );
	const hasSubtotalDiscount = subtotalBeforeDiscounts > responseCart.sub_total_integer;

	return (
		<Card>
			<CardBody>
				<Text as="h2" weight={ 600 } style={ { fontSize: '1.25rem', marginBlockEnd: '1rem' } }>
					{ __( 'Your order' ) }
				</Text>

				<VStack spacing={ 4 } style={ { marginBlockEnd: '0.75rem' } }>
					{ responseCart.products.map( ( product ) => (
						<ProductLineItem key={ product.uuid } product={ product } />
					) ) }
					<CouponLineItem responseCart={ responseCart } />
				</VStack>

				<CardDivider />

				<VStack spacing={ 2 } style={ { paddingBlockStart: '1rem', marginBlockStart: '0.25rem' } }>
					<HStack justify="space-between" spacing={ 2 }>
						<Text style={ { fontSize: '0.875rem' } }>{ __( 'Subtotal' ) }</Text>
						<span style={ { display: 'flex', gap: '4px', alignItems: 'baseline', flexShrink: 0 } }>
							{ hasSubtotalDiscount && (
								<s style={ { color: '#646970', fontSize: '0.875rem' } }>
									{ formatCurrency( subtotalBeforeDiscounts, responseCart.currency, {
										isSmallestUnit: true,
										stripZeros: true,
									} ) }
								</s>
							) }
							<Text style={ { fontSize: '0.875rem' } }>
								{ formatCurrency( responseCart.sub_total_integer, responseCart.currency, {
									isSmallestUnit: true,
									stripZeros: true,
								} ) }
							</Text>
						</span>
					</HStack>

					{ hasTax && (
						<HStack justify="space-between" spacing={ 2 }>
							<Text style={ { fontSize: '0.875rem' } }>{ __( 'Tax' ) }</Text>
							<Text style={ { fontSize: '0.875rem' } }>
								{ formatCurrency( responseCart.total_tax_integer, responseCart.currency, {
									isSmallestUnit: true,
									stripZeros: true,
								} ) }
							</Text>
						</HStack>
					) }

					{ hasCredits && (
						<HStack justify="space-between" spacing={ 2 }>
							<Text style={ { fontSize: '0.875rem' } }>{ __( 'Credits' ) }</Text>
							<Text style={ { fontSize: '0.875rem' } }>
								{ formatCurrency( -responseCart.credits_integer, responseCart.currency, {
									isSmallestUnit: true,
									stripZeros: true,
								} ) }
							</Text>
						</HStack>
					) }

					<CardDivider />

					<HStack justify="space-between" spacing={ 2 }>
						<Text weight={ 600 }>{ __( 'Total' ) }</Text>
						<Text weight={ 600 }>
							{ formatCurrency( responseCart.total_cost_integer, responseCart.currency, {
								isSmallestUnit: true,
								stripZeros: true,
							} ) }
						</Text>
					</HStack>
				</VStack>
			</CardBody>
		</Card>
	);
}
