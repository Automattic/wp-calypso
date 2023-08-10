import { CustomSelectControl } from '@wordpress/components';
import { TranslateResult, useTranslate } from 'i18n-calypso';
import { PlanSelectedStorage } from '..';
import { getStorageStringFromFeature } from '../util';
import type { PlanSlug, StorageOption } from '@automattic/calypso-products';

type StorageAddOnDropdownProps = {
	planSlug: PlanSlug;
	storageOptions: StorageOption[];
	selectedStorage: PlanSelectedStorage;
	setSelectedStorage: ( selectedStorage: PlanSelectedStorage ) => void;
};

const StorageAddOnDropdown = ( {
	planSlug,
	storageOptions,
	selectedStorage,
	setSelectedStorage,
}: StorageAddOnDropdownProps ) => {
	const translate = useTranslate();

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
	const selectedOptionKey = selectedStorage[ planSlug ] || defaultStorageOption?.slug || '';
	const selectedOption = {
		key: selectedOptionKey,
		name: getStorageStringFromFeature( selectedOptionKey ),
	};
	return (
		<CustomSelectControl
			label={ translate( 'Storage' ) }
			options={ selectControlOptions }
			value={ selectedOption }
			onChange={ ( { selectedItem }: { selectedItem: { key?: string } } ) => {
				const updatedSelectedStorage = {
					[ planSlug ]: selectedItem?.key || '',
				} as PlanSelectedStorage;

				setSelectedStorage( updatedSelectedStorage );
			} }
		/>
	);
};

export default StorageAddOnDropdown;
