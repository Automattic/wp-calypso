import { Icon, info } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { Option } from 'calypso/a8c-for-agencies/components/slider';
import useProductsQuery from 'calypso/a8c-for-agencies/data/marketplace/use-products-query';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { APIProductFamily } from 'calypso/state/partner-portal/types';
import wpcomBulkOptions from './lib/wpcom-bulk-options';
import A4AWPCOMSlider from './wpcom-slider';

type TierProps = Option & {
	discount: number;
};

type Props = {
	selectedTier: TierProps;
	onSelectTier: ( value: TierProps ) => void;
	ownedPlans: number;
};

const calculateTier = ( options: TierProps[], value: number ) => {
	let tier = options[ 0 ];

	for ( const option of options ) {
		if ( Number( option.value ) > value ) {
			break;
		}

		tier = option;
	}

	return {
		...tier,
		value,
	};
};

export default function WPCOMBulkSelector( { selectedTier, onSelectTier, ownedPlans }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const { data } = useProductsQuery( false, true );

	const wpcomProducts = data
		? ( data.find(
				( product ) => product.slug === 'wpcom-hosting'
		  ) as unknown as APIProductFamily )
		: undefined;

	const options = wpcomBulkOptions( wpcomProducts?.discounts?.tiers );

	const onSelectOption = useCallback(
		( option: number ) => {
			dispatch(
				recordTracksEvent( 'calypso_a4a_marketplace_hosting_wpcom_select_count', {
					count: option,
				} )
			);

			onSelectTier( calculateTier( options, option ) );
		},
		[ dispatch, onSelectTier, options ]
	);

	const selectedOption = options.findIndex(
		( { value } ) => value === ( selectedTier ? selectedTier.value : null )
	);

	return (
		<div className="bulk-selection">
			{ ownedPlans && (
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
			/>
		</div>
	);
}
