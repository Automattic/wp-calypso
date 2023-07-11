import { CustomSelectControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { PlanSelectedStorage } from '..';
import { PlanProperties } from '../types';
import { getStorageStringFromFeature } from '../util';

type StorageAddOnDropdownProps = {
	planProperties: PlanProperties;
	selectedStorage: PlanSelectedStorage;
	handleSelectedStorageChange: ( selectedStorage: PlanSelectedStorage ) => void;
};

export const StorageAddOnDropdown = ( {
	planProperties,
	selectedStorage,
	handleSelectedStorageChange,
}: StorageAddOnDropdownProps ) => {
	const { planName, storageOptions, storageFeatures } = planProperties;
	const translate = useTranslate();

	const selectControlOptions = storageOptions.map( ( storageOption ) => ( {
		key: storageOption,
		name: getStorageStringFromFeature( storageOption ) || '',
	} ) );

	const selectedOptionKey = selectedStorage[ planName ] || storageFeatures[ 0 ];
	const selectedOption = {
		key: selectedOptionKey,
		name: getStorageStringFromFeature( selectedOptionKey ) || '',
	};

	return (
		<CustomSelectControl
			label={ translate( 'Storage' ) }
			options={ selectControlOptions }
			value={ selectedOption }
			onChange={ ( { selectedItem } ) => {
				const updatedSelectedStorage = {
					...selectedStorage,
					[ planName ]: selectedItem?.key || '',
				};

				handleSelectedStorageChange( {
					...selectedStorage,
					selectedStorage: updatedSelectedStorage,
				} );
			} }
		/>
	);
};
