import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import A4ASlider, { Option } from 'calypso/a8c-for-agencies/components/slider';
import useProductsQuery from 'calypso/a8c-for-agencies/data/marketplace/use-products-query';
import wpcomBulkOptions from 'calypso/a8c-for-agencies/sections/marketplace/lib/wpcom-bulk-options';
import { APIProductFamily } from 'calypso/state/partner-portal/types';

type Props = {
	ownedPlans: number;
	quantity: number;
	onChange: ( quantity: number ) => void;
};

export default function WPCOMPlanSlider( { quantity, ownedPlans, onChange }: Props ) {
	const translate = useTranslate();

	const { data } = useProductsQuery( false, true );

	const wpcomProducts = data
		? ( data.find(
				( product ) => product.slug === 'wpcom-hosting'
		  ) as unknown as APIProductFamily )
		: undefined;

	const options = useMemo( () => {
		const options = wpcomBulkOptions( wpcomProducts?.discounts?.tiers );

		// Override the last option label to include '+' symbol.
		options[ options.length - 1 ].label = options[ options.length - 1 ].label + '+';
		return options;
	}, [ wpcomProducts?.discounts?.tiers ] );

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
