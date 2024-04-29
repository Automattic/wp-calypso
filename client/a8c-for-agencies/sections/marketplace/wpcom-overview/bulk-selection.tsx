import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import A4ASlider, { Option } from 'calypso/a8c-for-agencies/components/slider';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import wpcomBulkOptions from './lib/wpcom-bulk-options';

type Props = {
	selectedCount: {
		value: number;
		label: string;
	};
	onSelectCount: ( count: { value: number; label: string } ) => void;
};

export default function WPCOMBulkSelector( { selectedCount, onSelectCount }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const onSelectOption = useCallback(
		( option: Option ) => {
			dispatch(
				recordTracksEvent( 'calypso_a4a_marketplace_hosting_wpcom_select_count', {
					count: option.value,
				} )
			);
			onSelectCount( {
				value: option.value as number,
				label: option.label,
			} );
		},
		[ dispatch, onSelectCount ]
	);

	const selectedOption = wpcomBulkOptions.findIndex(
		( { value } ) => value === ( selectedCount ? selectedCount.value : null )
	);

	return (
		<div className="bulk-selection">
			<div>
				<A4ASlider
					label={ translate( 'Total sites' ) }
					sub={ translate( 'Total discount' ) }
					value={ selectedOption }
					onChange={ onSelectOption }
					options={ wpcomBulkOptions }
				/>
			</div>
		</div>
	);
}
