import { AddOns, WpcomPlansUI } from '@automattic/data-stores';
import { CustomSelectControl } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useCallback, useEffect, useMemo } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { usePlansGridContext } from '../../../../grid-context';
import useIsLargeCurrency from '../../../../hooks/use-is-large-currency';
import DropdownOption from '../../../dropdown-option';
import useAvailableStorageOptions from '../hooks/use-available-storage-options';
import useDefaultStorageOption from '../hooks/use-default-storage-option';
import useStorageStringFromFeature from '../hooks/use-storage-string-from-feature';
import type {
	PlanSlug,
	WPComPlanStorageFeatureSlug,
	WPComStorageAddOnSlug,
} from '@automattic/calypso-products';
import type { AddOnMeta } from '@automattic/data-stores';

type StorageFeatureDropdownProps = {
	planSlug: PlanSlug;
	onStorageAddOnClick?: ( addOnSlug: WPComStorageAddOnSlug ) => void;
	priceOnSeparateLine?: boolean;
};

type StorageFeatureDropdownOptionProps = {
	planSlug: PlanSlug;
	price?: string;
	storageSlug: WPComStorageAddOnSlug | WPComPlanStorageFeatureSlug;
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

const StorageFeatureDropdownOption = ( {
	planSlug,
	price,
	storageSlug,
	isLargeCurrency = false,
	priceOnSeparateLine,
}: StorageFeatureDropdownOptionProps ) => {
	const translate = useTranslate();
	const { siteId } = usePlansGridContext();
	const title = useStorageStringFromFeature( { storageSlug, siteId, planSlug } ) ?? '';

	return (
		<>
			{ price && ! isLargeCurrency && ! priceOnSeparateLine ? (
				<DropdownOption className="storage-add-on-dropdown-option" title={ title }>
					<span>
						{ translate(
							'{{priceSpan}}+{{nbsp/}}%(price)s{{/priceSpan}}{{perMonthSpan}}/month{{/perMonthSpan}}',
							{
								args: { price },
								components: {
									nbsp: <>&nbsp;</>,
									priceSpan: <span className="storage-add-on-dropdown-option__price" />,
									perMonthSpan: <span className="storage-add-on-dropdown-option__per-month" />,
								},
								comment: 'The cost of a storage add on per month. Example reads as "+ $50/month"',
							}
						) }
					</span>
				</DropdownOption>
			) : (
				<span className="storage-add-on-dropdown-option__title">{ title }</span>
			) }
		</>
	);
};

const StorageFeatureDropdown = ( {
	planSlug,
	onStorageAddOnClick,
	priceOnSeparateLine = false,
}: StorageFeatureDropdownProps ) => {
	const translate = useTranslate();
	const { gridPlansIndex, siteId } = usePlansGridContext();
	const {
		pricing: { currencyCode },
	} = gridPlansIndex[ planSlug ];
	const { setSelectedStorageOptionForPlan } = useDispatch( WpcomPlansUI.store );
	const storageAddOns = AddOns.useStorageAddOns( { siteId } );
	const storageAddOnPrices = useMemo(
		() => storageAddOns?.map( ( addOn ) => addOn?.prices?.monthlyPrice ?? 0 ),
		[ storageAddOns ]
	);
	const isLargeCurrency = useIsLargeCurrency( {
		prices: storageAddOnPrices,
		isAddOn: true,
		currencyCode: currencyCode || 'USD',
	} );
	const selectedStorageOptionForPlan = useSelect(
		( select ) => select( WpcomPlansUI.store ).getSelectedStorageOptionForPlan( planSlug, siteId ),
		[ planSlug ]
	);
	const defaultStorageOption = useDefaultStorageOption( { planSlug } );

	const availableStorageOptions = useAvailableStorageOptions( { planSlug } );

	useEffect( () => {
		if ( ! selectedStorageOptionForPlan ) {
			defaultStorageOption &&
				setSelectedStorageOptionForPlan( {
					addOnSlug: defaultStorageOption,
					planSlug,
					siteId,
				} );
		}
	}, [] );

	const selectControlOptions = availableStorageOptions?.map( ( slug ) => {
		return {
			key: slug,
			name: (
				<StorageFeatureDropdownOption
					planSlug={ planSlug }
					price={ getStorageOptionPrice( storageAddOns, slug ) }
					storageSlug={ slug }
				/>
			),
		};
	} );

	const selectedOptionPrice = getStorageOptionPrice( storageAddOns, selectedStorageOptionForPlan );

	const selectedOption = {
		key: selectedStorageOptionForPlan,
		name: (
			<StorageFeatureDropdownOption
				planSlug={ planSlug }
				price={ selectedOptionPrice }
				storageSlug={ selectedStorageOptionForPlan }
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
				setSelectedStorageOptionForPlan( { addOnSlug, planSlug, siteId } );
			}
		},
		[ onStorageAddOnClick, planSlug, setSelectedStorageOptionForPlan, siteId ]
	);

	return (
		<>
			<CustomSelectControl
				hideLabelFromVision
				options={ selectControlOptions }
				value={ selectedOption }
				onChange={ handleOnChange }
			/>
			{ selectedOptionPrice && ( isLargeCurrency || priceOnSeparateLine ) && (
				<div className="storage-add-on-dropdown__offset-price-container">
					<span className="storage-add-on-dropdown__offset-price">
						{ translate( '+ %(selectedOptionPrice)s/month', {
							args: { selectedOptionPrice },
						} ) }
					</span>
				</div>
			) }
		</>
	);
};

export default StorageFeatureDropdown;
