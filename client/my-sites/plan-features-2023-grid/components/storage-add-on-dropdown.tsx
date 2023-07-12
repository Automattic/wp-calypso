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
	const { planName, storageOptions, storageFeatures } = planProperties;
	const translate = useTranslate();

	// TODO: Consider transforming storageOptions outside of this component
	const selectControlOptions = storageOptions.reduce(
		( acc: { key: string; name: string }[], storageOption ) => {
			const storageString = getStorageStringFromFeature( storageOption );

			// Only show storage options that have a string to display
			if ( storageString ) {
				acc.push( {
					key: storageOption,
					name: storageString,
				} );
			}

			return acc;
		},
		[]
	);

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
					[ planName ]: selectedItem?.key || '',
				};

				setSelectedStorage( updatedSelectedStorage );
			} }
		/>
	);
};
