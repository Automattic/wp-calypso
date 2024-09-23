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
	onSelectTier?: ( value: DiscountTier ) => void;
	ownedPlans: number;
	isLoading?: boolean;
	hideOwnedPlansBadge?: boolean;
	hideNumberInput?: boolean;
	quantity?: number;
};

export default function WPCOMBulkSelector( {
	selectedTier,
	onSelectTier,
	ownedPlans,
	isLoading,
	hideOwnedPlansBadge,
	hideNumberInput,
	quantity,
}: Props ) {
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
			onSelectTier?.( calculateTier( options, option ) );
		},
		[ onSelectTier, options ]
	);

	const selectedOption = options.findIndex(
		( { value } ) => value === ( selectedTier ? selectedTier.value : null )
	);

	const minimumQuantity = ownedPlans + 1;

	useEffect( () => {
		if ( ! hideNumberInput ) {
			onSelectTier?.( calculateTier( options, minimumQuantity ) );
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ ownedPlans, options, hideNumberInput ] );

	if ( isLoading ) {
		return (
			<div className="bulk-selection is-placeholder">
				<div className="bulk-selection__slider"></div>
			</div>
		);
	}

	return (
		<div className="bulk-selection">
			{ !! ownedPlans && ! hideOwnedPlansBadge && (
				<div className="bulk-selection__owned-plan">
					<Icon icon={ info } size={ 24 } />

					<span>
						{ translate(
							'You own {{b}}%(count)s site{{/b}}',
							'You own {{b}}%(count)s sites{{/b}}',
							{
								args: {
									count: ownedPlans,
								},
								components: {
									b: <strong />,
								},
								count: ownedPlans,
								comment: '%(count)s is the number of WordPress.com sites owned by the user',
							}
						) }
					</span>
				</div>
			) }

			<A4AWPCOMSlider
				label={ translate( 'Total sites' ) }
				sub={ translate( 'Total discount' ) }
				value={ selectedOption }
				quantity={ quantity }
				onChange={ onSelectOption }
				options={ options }
				minimum={ minimumQuantity }
				hideNumberInput={ hideNumberInput }
			/>
		</div>
	);
}
