import { WpcomPlansUI } from '@automattic/data-stores';
import { CustomSelectControl } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import { usePlansGridContext } from '../grid-context';
import { useIsLargeAddOnCurrency } from '../hooks/npm-ready/use-is-large-add-on-currency';
import { getStorageStringFromFeature } from '../util';
import type { PlanSlug, StorageOption, WPComStorageAddOnSlug } from '@automattic/calypso-products';
import type { AddOnMeta } from '@automattic/data-stores';

type StorageAddOnDropdownProps = {
	label?: string;
	planSlug: PlanSlug;
	storageOptions: StorageOption[];
	onStorageAddOnClick?: ( addOnSlug: WPComStorageAddOnSlug ) => void;
	priceOnSeparateLine?: boolean;
};

type StorageAddOnOptionProps = {
	title: string;
	price?: string;
	isLargeCurrency?: boolean;
	priceOnSeparateLine?: boolean;
};

const getStorageOptionPrice = (
	storageAddOnsForPlan: ( AddOnMeta | null )[] | null,
	storageOptionSlug: string
) => {
	return storageAddOnsForPlan?.find( ( addOn ) => {
		return addOn?.featureSlugs?.includes( storageOptionSlug );
	} )?.prices?.formattedMonthlyPrice;
};

const StorageAddOnOption = ( {
	title,
	price,
	isLargeCurrency = false,
	priceOnSeparateLine,
}: StorageAddOnOptionProps ) => {
	const translate = useTranslate();

	return (
		<>
			{ price && ! isLargeCurrency && ! priceOnSeparateLine ? (
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
	priceOnSeparateLine = false,
}: StorageAddOnDropdownProps ) => {
	const translate = useTranslate();
	const { gridPlansIndex } = usePlansGridContext();
	const {
		pricing: { currencyCode },
		storageAddOnsForPlan,
	} = gridPlansIndex[ planSlug ];
	const { setSelectedStorageOptionForPlan } = useDispatch( WpcomPlansUI.store );
	const isLargeCurrency = useIsLargeAddOnCurrency( {
		storageAddOns: storageAddOnsForPlan,
		currencyCode: currencyCode || 'USD',
	} );
	const selectedStorageOptionForPlan = useSelect(
		( select ) => select( WpcomPlansUI.store ).getSelectedStorageOptionForPlan( planSlug ),
		[ planSlug ]
	);
	const selectControlOptions = storageOptions.map( ( storageOption ) => {
		const title = getStorageStringFromFeature( storageOption.slug ) || '';
		const price = getStorageOptionPrice( storageAddOnsForPlan, storageOption.slug );
		return {
			key: storageOption.slug,
			name: <StorageAddOnOption title={ title } price={ price } />,
		};
	} );

	const selectedOptionKey = selectedStorageOptionForPlan
		? selectedStorageOptionForPlan
		: storageOptions.find( ( storageOption ) => ! storageOption.isAddOn )?.slug;
	const selectedOptionPrice =
		selectedOptionKey && getStorageOptionPrice( storageAddOnsForPlan, selectedOptionKey );
	const selectedOptionTitle = selectedOptionKey && getStorageStringFromFeature( selectedOptionKey );

	const selectedOption = {
		key: selectedOptionKey,
		name: (
			<StorageAddOnOption
				title={ selectedOptionTitle }
				price={ selectedOptionPrice }
				isLargeCurrency={ isLargeCurrency }
				priceOnSeparateLine={ priceOnSeparateLine }
			/>
		),
	};
	return (
		<>
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
			{ selectedOptionPrice && ( isLargeCurrency || priceOnSeparateLine ) && (
				<div className="storage-add-on-dropdown__offset-price-container">
					<span className="storage-add-on-dropdown__offset-price">
						{ ` + ${ selectedOptionPrice }/${ translate( 'month' ) }` }
					</span>
				</div>
			) }
		</>
	);
};

export default StorageAddOnDropdown;
