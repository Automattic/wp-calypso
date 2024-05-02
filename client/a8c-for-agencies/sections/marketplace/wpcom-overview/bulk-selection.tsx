import { Icon, info } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useMemo } from 'react';
import useProductsQuery from 'calypso/a8c-for-agencies/data/marketplace/use-products-query';
import { APIProductFamily } from 'calypso/state/partner-portal/types';
import wpcomBulkOptions from './lib/wpcom-bulk-options';
import { DiscountTier, calculateTier } from './lib/wpcom-bulk-values-utils';
import A4AWPCOMSlider from './wpcom-slider';

type Props = {
	selectedTier: DiscountTier;
	onSelectTier: ( value: DiscountTier ) => void;
	ownedPlans: number;
};

export default function WPCOMBulkSelector( { selectedTier, onSelectTier, ownedPlans }: Props ) {
	const translate = useTranslate();

	const { data } = useProductsQuery( false, true );

	const wpcomProducts = data
		? ( data.find(
				( product ) => product.slug === 'wpcom-hosting'
		  ) as unknown as APIProductFamily )
		: undefined;

	const options = useMemo(
		() => wpcomBulkOptions( wpcomProducts?.discounts?.tiers ),
		[ wpcomProducts?.discounts?.tiers ]
	);

	const onSelectOption = useCallback(
		( option: number ) => {
			onSelectTier( calculateTier( options, option ) );
		},
		[ onSelectTier, options ]
	);

	const selectedOption = options.findIndex(
		( { value } ) => value === ( selectedTier ? selectedTier.value : null )
	);

	const minimumQuantity = ownedPlans + 1;

	useEffect( () => {
		onSelectTier( calculateTier( options, minimumQuantity ) );
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ ownedPlans, options ] );

	return (
		<div className="bulk-selection">
			{ !! ownedPlans && (
				<div className="bulk-selection__owned-plan">
					<Icon icon={ info } size={ 24 } />

					<span>
						{ translate(
							'You own {{b}}%(count)s Creator plan{{/b}}',
							'You own {{b}}%(count)s Creator plans{{/b}}',
							{
								args: {
									count: ownedPlans,
								},
								components: {
									b: <strong />,
								},
								count: ownedPlans,
								comment: '%(count)s is the number of Creator plans owned by the user',
							}
						) }
					</span>
				</div>
			) }

			<A4AWPCOMSlider
				label={ translate( 'Total sites' ) }
				sub={ translate( 'Total discount' ) }
				value={ selectedOption }
				onChange={ onSelectOption }
				options={ options }
				minimum={ minimumQuantity }
			/>
		</div>
	);
}
