import { isEnabled } from '@automattic/calypso-config';
import { useTranslate } from 'i18n-calypso';
import { useContext, useMemo } from 'react';
import A4ASlider, { Option } from 'calypso/a8c-for-agencies/components/slider';
import useProductsQuery from 'calypso/a8c-for-agencies/data/marketplace/use-products-query';
import { TermPricingContext } from 'calypso/a8c-for-agencies/sections/marketplace/context';
import { calculateDiscountPercentage } from 'calypso/a8c-for-agencies/sections/marketplace/hooks/use-marketplace';
import wpcomBulkOptions from 'calypso/a8c-for-agencies/sections/marketplace/lib/wpcom-bulk-options';
import type { TermPricingType } from 'calypso/a8c-for-agencies/sections/marketplace/types';
import type {
	APIProductFamily,
	APIProductFamilyProduct,
} from 'calypso/a8c-for-agencies/types/products';

type Props = {
	ownedPlans: number;
	quantity: number;
	onChange: ( quantity: number ) => void;
	plan?: APIProductFamilyProduct;
};

const createOptionsFromPriceTierList = (
	plan: APIProductFamilyProduct,
	termPricing: TermPricingType
) => {
	const priceTierList =
		termPricing === 'yearly' ? plan.tier_yearly_prices || [] : plan.tier_monthly_prices || [];
	const basePrice = termPricing === 'yearly' ? plan.yearly_price ?? 0 : plan.monthly_price ?? 0;

	const options = priceTierList.map( ( tier ) => {
		const discountPercent = calculateDiscountPercentage( basePrice, tier.price );

		return {
			value: tier.units,
			label: `${ tier.units }`,
			discount: discountPercent / 100,
			sub: discountPercent > 0 ? `${ discountPercent }%` : '',
		};
	} );

	// Ensure first option is always 1
	if ( options.length === 0 || options[ 0 ]?.value !== 1 ) {
		options.unshift( {
			value: 1,
			label: '1',
			discount: 0,
			sub: '',
		} );
	}

	return options;
};

export default function WPCOMPlanSlider( { quantity, ownedPlans, onChange, plan }: Props ) {
	const translate = useTranslate();
	const { termPricing } = useContext( TermPricingContext );

	const isTermPricingEnabled = isEnabled( 'a4a-bd-term-pricing' ) && isEnabled( 'a4a-bd-checkout' );

	const { data } = useProductsQuery( true );

	const wpcomProducts = data
		? ( data.find(
				( product ) => product.slug === 'wpcom-hosting'
		  ) as unknown as APIProductFamily )
		: undefined;

	const options = useMemo( () => {
		let sliderOptions = [];

		if ( isTermPricingEnabled && termPricing && plan ) {
			// Use tiered prices when term pricing is enabled
			sliderOptions = createOptionsFromPriceTierList( plan, termPricing );
		} else {
			// Fallback to discount tiers
			sliderOptions = wpcomBulkOptions( wpcomProducts?.discounts?.tiers );
		}

		// Override the last option label to include '+' symbol.
		sliderOptions[ sliderOptions.length - 1 ].label =
			sliderOptions[ sliderOptions.length - 1 ].label + '+';
		return sliderOptions;
	}, [ wpcomProducts?.discounts?.tiers, isTermPricingEnabled, termPricing, plan ] );

	const MaxValue = options[ options.length - 1 ].value;

	const isOverMaxValue = quantity + ownedPlans > MaxValue;

	const onSelectOption = ( option: Option ) => {
		if ( option ) {
			if ( option.value === MaxValue && isOverMaxValue ) {
				return;
			}

			onChange( ( option.value as number ) - ownedPlans );
		}
	};

	const value = isOverMaxValue
		? MaxValue
		: options.findIndex( ( option ) => option.value === ownedPlans + quantity );

	return (
		<A4ASlider
			label={ translate( 'Total sites' ) }
			sub={ translate( 'Total discount' ) }
			value={ value }
			onChange={ onSelectOption }
			options={ options }
			minimum={ ownedPlans }
		/>
	);
}
