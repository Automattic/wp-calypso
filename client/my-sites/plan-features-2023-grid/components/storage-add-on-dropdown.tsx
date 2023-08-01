import { CustomSelectControl } from '@wordpress/components';
import { TranslateResult, useTranslate } from 'i18n-calypso';
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
	const { planName, storageFeatures } = planProperties;
	const translate = useTranslate();

	// TODO: Consider transforming storageOptions outside of this component
	const selectControlOptions = storageFeatures.reduce(
		( acc: { key: string; name: TranslateResult }[], storageFeature: string ) => {
			const title = getStorageStringFromFeature( storageFeature );
			if ( title ) {
				acc.push( {
					key: storageFeature,
					name: title,
				} );
			}

			return acc;
		},
		[]
	);

	const selectedOptionKey = selectedStorage[ planName ] || storageFeatures[ 0 ] || '';
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
					[ planName ]: selectedItem?.key || '',
				} as PlanSelectedStorage;

				setSelectedStorage( updatedSelectedStorage );
			} }
		/>
	);
};
