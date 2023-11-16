import { WpcomPlansUI } from '@automattic/data-stores';
import { CustomSelectControl } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useCallback, useEffect, useMemo } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { usePlansGridContext } from '../grid-context';
import useDefaultStorageOption from '../hooks/npm-ready/data-store/use-default-storage-option';
import useIsLargeCurrency from '../hooks/npm-ready/use-is-large-currency';
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
	title?: string;
	price?: string;
	isLargeCurrency?: boolean;
	priceOnSeparateLine?: boolean;
};

const getStorageOptionPrice = (
	storageAddOnsForPlan: ( AddOnMeta | null )[] | null,
	storageOptionSlug: string
) => {
	return storageAddOnsForPlan?.find(
		( addOn ) => addOn?.featureSlugs?.includes( storageOptionSlug )
	)?.prices?.formattedMonthlyPrice;
};

const StorageAddOnOption = ( {
	title,
	price,
	isLargeCurrency = false,
	priceOnSeparateLine,
}: StorageAddOnOptionProps ) => {
	const translate = useTranslate();

	if ( ! title ) {
		return null;
	}

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
	const storageAddOnPrices = useMemo(
		() => storageAddOnsForPlan?.map( ( addOn ) => addOn?.prices?.monthlyPrice ?? 0 ),
		[ storageAddOnsForPlan ]
	);
	const isLargeCurrency = useIsLargeCurrency( {
		prices: storageAddOnPrices,
		isAddOn: true,
		currencyCode: currencyCode || 'USD',
	} );
	const selectedStorageOptionForPlan = useSelect(
		( select ) => select( WpcomPlansUI.store ).getSelectedStorageOptionForPlan( planSlug ),
		[ planSlug ]
	);
	const defaultStorageOption = useDefaultStorageOption( {
		storageOptions,
		storageAddOnsForPlan,
	} );

	useEffect( () => {
		if ( storageAddOnsForPlan && defaultStorageOption && ! selectedStorageOptionForPlan ) {
			setSelectedStorageOptionForPlan( { addOnSlug: defaultStorageOption, planSlug } );
		}
	}, [] );

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
		: defaultStorageOption;
	const selectedOptionPrice =
		selectedOptionKey && getStorageOptionPrice( storageAddOnsForPlan, selectedOptionKey );
	const selectedOptionTitle =
		( selectedOptionKey && getStorageStringFromFeature( selectedOptionKey ) ) || '';

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

	const handleOnChange = useCallback(
		( { selectedItem }: { selectedItem: { key: WPComStorageAddOnSlug } } ) => {
			const addOnSlug = selectedItem?.key;

			if ( addOnSlug ) {
				onStorageAddOnClick && onStorageAddOnClick( addOnSlug );
				setSelectedStorageOptionForPlan( { addOnSlug, planSlug } );
			}
		},
		[ onStorageAddOnClick, planSlug, setSelectedStorageOptionForPlan ]
	);

	return (
		<>
			<CustomSelectControl
				label={ label }
				options={ selectControlOptions }
				value={ selectedOption }
				onChange={ handleOnChange }
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
