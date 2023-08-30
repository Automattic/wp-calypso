import { WpcomPlansUI } from '@automattic/data-stores';
import { CustomSelectControl } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { TranslateResult, useTranslate } from 'i18n-calypso';
import { usePlansGridContext } from '../grid-context';
import { getStorageStringFromFeature } from '../util';
import type { PlanSlug, StorageOption, WPComStorageAddOnSlug } from '@automattic/calypso-products';

type StorageAddOnDropdownProps = {
	planSlug: PlanSlug;
	storageOptions: StorageOption[];
};

const getStorageOptionName = ( storageAddOnsForPlan, storageOptionSlug: string ) => {
	const cost = storageAddOnsForPlan?.find( ( addOn ) => {
		return addOn?.featureSlugs?.includes( storageOptionSlug );
	} )?.costData?.formattedMonthlyCost;
	const title = getStorageStringFromFeature( storageOptionSlug );

	return `${ title } ${ cost ? '+ ' + cost : '' }`;
};

export const StorageAddOnDropdown = ( { planSlug, storageOptions }: StorageAddOnDropdownProps ) => {
	const translate = useTranslate();
	const { gridPlansIndex } = usePlansGridContext();
	const { storageAddOnsForPlan } = gridPlansIndex[ planSlug ];
	const { setSelectedStorageOptionForPlan } = useDispatch( WpcomPlansUI.store );
	const selectedStorageOptionForPlan = useSelect(
		( select ) => {
			return select( WpcomPlansUI.store ).getSelectedStorageOptionForPlan( planSlug );
		},
		[ planSlug ]
	);

	// TODO: Consider transforming storageOptions outside of this component
	const selectControlOptions = storageOptions.reduce( ( acc, storageOption ) => {
		const name = getStorageOptionName( storageAddOnsForPlan, storageOption.slug );
		acc.push( {
			key: storageOption?.slug,
			name,
		} );

		return acc;
	}, [] as { key: string; name: TranslateResult }[] );

	const defaultStorageOption = storageOptions.find( ( storageOption ) => ! storageOption?.isAddOn );
	const selectedOptionKey = selectedStorageOptionForPlan || defaultStorageOption?.slug || '';
	const selectedOption = {
		key: selectedOptionKey,
		name: getStorageOptionName( storageAddOnsForPlan, selectedOptionKey ),
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
