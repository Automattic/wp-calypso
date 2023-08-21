import { WpcomPlansUI } from '@automattic/data-stores';
import { CustomSelectControl } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { TranslateResult, useTranslate } from 'i18n-calypso';
import { getStorageStringFromFeature } from '../util';
import type { PlanSlug, StorageOption, WPComStorageAddOnSlug } from '@automattic/calypso-products';

type StorageAddOnDropdownProps = {
	planSlug: PlanSlug;
	storageOptions: StorageOption[];
};

export const StorageAddOnDropdown = ( { planSlug, storageOptions }: StorageAddOnDropdownProps ) => {
	const translate = useTranslate();
	const { setSelectedStorageOptionForPlan } = useDispatch( WpcomPlansUI.store );
	const selectedStorage = useSelect(
		( select ) => {
			return select( WpcomPlansUI.store ).getSelectedStorageOptionsForPlan( planSlug );
		},
		[ planSlug ]
	);

	// TODO: Consider transforming storageOptions outside of this component
	const selectControlOptions = storageOptions.reduce( ( acc, storageOption ) => {
		const title = getStorageStringFromFeature( storageOption.slug );
		if ( title ) {
			acc.push( {
				key: storageOption?.slug,
				name: title,
			} );
		}

		return acc;
	}, [] as { key: string; name: TranslateResult }[] );

	const defaultStorageOption = storageOptions.find( ( storageOption ) => ! storageOption?.isAddOn );
	const selectedOptionKey = selectedStorage || defaultStorageOption?.slug || '';
	const selectedOption = {
		key: selectedOptionKey,
		name: getStorageStringFromFeature( selectedOptionKey ),
	};
	return (
		<CustomSelectControl
			label={ translate( 'Storage' ) }
			options={ selectControlOptions }
			value={ selectedOption }
			onChange={ ( { selectedItem }: { selectedItem: { key: WPComStorageAddOnSlug } } ) =>
				setSelectedStorageOptionForPlan( { addOnSlug: selectedItem?.key || '', planSlug } )
			}
		/>
	);
};

export default StorageAddOnDropdown;
