import { CustomSelectControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { PlanSelectedStorage } from '..';
import { PlanProperties } from '../types';
import { getStorageStringFromFeature } from '../util';

type StorageAddOnDropdownProps = {
	planProperties: PlanProperties;
	selectedStorage: PlanSelectedStorage;
	setSelectedStorage: ( selectedStorage: PlanSelectedStorage ) => void;
};

export const StorageAddOnDropdown = ( {
	planProperties,
	selectedStorage,
	setSelectedStorage,
}: StorageAddOnDropdownProps ) => {
	const { planName, storageOptions } = planProperties;
	const translate = useTranslate();

	// TODO: Consider transforming storageOptions outside of this component
	const selectControlOptions = storageOptions.reduce(
		( acc: { key: string; name: string }[], storageOption ) => {
			if ( storageOption.title ) {
				acc.push( {
					key: storageOption?.key,
					name: storageOption.title,
				} );
			}

			return acc;
		},
		[]
	);

	const defaultStorageOption = storageOptions.find(
		( storageOption ) => storageOption?.planDefault
	);
	const selectedOptionKey = selectedStorage[ planName ] || defaultStorageOption?.key || '';
	const selectedOption = {
		key: selectedOptionKey,
		name: getStorageStringFromFeature( selectedOptionKey ) || defaultStorageOption?.title,
	};

	return (
		<CustomSelectControl
			label={ translate( 'Storage' ) }
			options={ selectControlOptions }
			value={ selectedOption }
			onChange={ ( { selectedItem }: { selectedItem: { key?: string } } ) => {
				const updatedSelectedStorage = {
					[ planName ]: selectedItem?.key || '',
				} as PlanSelectedStorage;

				setSelectedStorage( updatedSelectedStorage );
			} }
		/>
	);
};
