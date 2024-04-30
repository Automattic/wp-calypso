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
};

export default function WPCOMBulkSelector( { selectedTier, onSelectTier }: Props ) {
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
			const foundTier = options.find( ( { value } ) => value === option );
			if ( foundTier ) {
				onSelectTier( foundTier );
			}
		},
		[ dispatch, onSelectTier, options ]
	);

	const selectedOption = options.findIndex(
		( { value } ) => value === ( selectedTier ? selectedTier.value : null )
	);

	return (
		<div className="bulk-selection">
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
