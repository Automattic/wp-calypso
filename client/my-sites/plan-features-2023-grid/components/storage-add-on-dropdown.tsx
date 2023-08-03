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
	const { planName, storageOptions, storageAddOns } = planProperties;
	const translate = useTranslate();
	// TODO: Consider transforming storageOptions outside of this component
	const selectControlOptions = storageOptions.reduce(
		( acc: { key: string; name: TranslateResult }[], storageOption ) => {
			const title = getStorageStringFromFeature( storageOption.slug );
			// TODO: Fix typescript errors
			const cost = storageAddOns.find( ( addOn ) => {
				return addOn.featureSlugs.includes( storageOption.slug );
			} )?.costData?.formattedMonthlyCost;

			const name = `${ title } ${ cost ? cost : '' }`;
			if ( title ) {
				acc.push( {
					key: storageOption.slug,
					name: name,
				} );
			}

			return acc;
		},
		[]
	);

	const selectedOptionKey = selectedStorage[ planName ] || storageOptions[ 0 ].slug || '';
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
