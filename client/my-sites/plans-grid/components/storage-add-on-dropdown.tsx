import { WpcomPlansUI } from '@automattic/data-stores';
import { CustomSelectControl } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import { usePlansGridContext } from '../grid-context';
import { getStorageStringFromFeature } from '../util';
import type { PlanSlug, StorageOption, WPComStorageAddOnSlug } from '@automattic/calypso-products';
import type { AddOnMeta } from '@automattic/data-stores';

type StorageAddOnDropdownProps = {
	label?: string;
	planSlug: PlanSlug;
	storageOptions: StorageOption[];
	onStorageAddOnClick?: ( addOnSlug: WPComStorageAddOnSlug ) => void;
};

type StorageAddOnOptionProps = {
	title: string;
	price: string | undefined;
};

const getStorageOptionPrice = (
	storageAddOnsForPlan: ( AddOnMeta | null )[] | null,
	storageOptionSlug: string
) => {
	return storageAddOnsForPlan?.find( ( addOn ) => {
		return addOn?.featureSlugs?.includes( storageOptionSlug );
	} )?.prices?.formattedMonthlyPrice;
};

const SelectedStorageOption = ( { title, price }: StorageAddOnOptionProps ) => {
	const translate = useTranslate();
	return (
		<>
			{ price ? (
				<div>
					<span className="storage-add-on-dropdown-option__title">{ title }</span>
					<span className="storage-add-on-dropdown-option__price">
						{ ` + ${ price }/${ translate( 'month' ) }` }
					</span>
				</div>
			) : (
				<span className="storage-add-on-dropdown-option__title">{ title }</span>
			) }
		</>
	);
};

const StorageAddOnOption = ( { title, price }: StorageAddOnOptionProps ) => {
	const translate = useTranslate();
	return (
		<>
			{ price ? (
				<div>
					<span className="storage-add-on-dropdown-option__title">{ title }</span>
					<div className="storage-add-on-dropdown-option__price-container">
						<span className="storage-add-on-dropdown-option__price">+&nbsp;{ price }</span>
						<span className="storage-add-on-dropdown-option__per-month">
							{ `/${ translate( 'month' ) }` }
						</span>
					</div>
				</div>
			) : (
				<span className="storage-add-on-dropdown-option__title">{ title }</span>
			) }
		</>
	);
};

export const StorageAddOnDropdown = ( {
	label = '',
	planSlug,
	storageOptions,
	onStorageAddOnClick,
}: StorageAddOnDropdownProps ) => {
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
	const selectControlOptions = storageOptions.map( ( storageOption ) => {
		const title = getStorageStringFromFeature( storageOption.slug ) || '';
		const price = getStorageOptionPrice( storageAddOnsForPlan, storageOption.slug );
		return {
			key: storageOption?.slug,
			name: <StorageAddOnOption title={ title } price={ price } />,
		};
	} );

	const defaultStorageOption = storageOptions.find( ( storageOption ) => ! storageOption?.isAddOn );
	const selectedOptionKey = selectedStorageOptionForPlan || defaultStorageOption?.slug || '';
	const selectedOptionPrice = getStorageOptionPrice( storageAddOnsForPlan, selectedOptionKey );
	const selectedOptionTitle = getStorageStringFromFeature( selectedOptionKey ) || '';
	const selectedOption = {
		key: selectedOptionKey,
		name: <SelectedStorageOption title={ selectedOptionTitle } price={ selectedOptionPrice } />,
	};
	return (
		<CustomSelectControl
			label={ label }
			options={ selectControlOptions }
			value={ selectedOption }
			onChange={ ( { selectedItem }: { selectedItem: { key: WPComStorageAddOnSlug } } ) => {
				const addOnSlug = selectedItem?.key;

				if ( addOnSlug ) {
					onStorageAddOnClick && onStorageAddOnClick( addOnSlug );
					setSelectedStorageOptionForPlan( { addOnSlug, planSlug } );
				}
			} }
		/>
	);
};

export default StorageAddOnDropdown;
