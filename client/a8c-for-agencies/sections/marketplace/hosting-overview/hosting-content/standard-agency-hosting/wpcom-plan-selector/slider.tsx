import { isEnabled } from '@automattic/calypso-config';
import { useTranslate } from 'i18n-calypso';
import { useContext, useMemo } from 'react';
import A4ASlider, { Option } from 'calypso/a8c-for-agencies/components/slider';
import useProductsQuery from 'calypso/a8c-for-agencies/data/marketplace/use-products-query';
import { TermPricingContext } from 'calypso/a8c-for-agencies/sections/marketplace/context';
import { getWPCOMTierPrices } from 'calypso/a8c-for-agencies/sections/marketplace/hooks/use-marketplace';
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
) =>
	getWPCOMTierPrices( plan, termPricing ).map( ( tier ) => ( {
		value: tier.units,
		label: `${ tier.units }`,
		discount: tier.discountPercentage / 100,
		sub: tier.discountPercentage > 0 ? `${ tier.discountPercentage }%` : '',
	} ) );

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
		let sliderOptions;

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

	const value = useMemo( () => {
		if ( isOverMaxValue ) {
			return options.length - 1;
		}
		const index = options.findIndex( ( option ) => option.value === ownedPlans + quantity );
		// If persisted value doesn't match any option, default to first valid option
		return index >= 0
			? index
			: Math.max(
					0,
					options.findIndex( ( o ) => o.value > ownedPlans )
				);
	}, [ isOverMaxValue, options, ownedPlans, quantity ] );

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
