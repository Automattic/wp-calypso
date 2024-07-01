import { AddOns, WpcomPlansUI } from '@automattic/data-stores';
import { CustomSelectControl } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useCallback, useEffect, useMemo } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { usePlansGridContext } from '../../../../grid-context';
import useIsLargeCurrency from '../../../../hooks/use-is-large-currency';
import DropdownOption from '../../../dropdown-option';
import useAvailableStorageOptions from '../hooks/use-available-storage-dropdown-options';
import useDefaultStorageOption from '../hooks/use-default-storage-option';
import useStorageStringFromFeature from '../hooks/use-storage-string-from-feature';
import type {
	PlanSlug,
	WPComPlanStorageFeatureSlug,
	WPComStorageAddOnSlug,
} from '@automattic/calypso-products';
import type { AddOnMeta } from '@automattic/data-stores';

type StorageDropdownProps = {
	planSlug: PlanSlug;
	onStorageAddOnClick?: ( addOnSlug: WPComStorageAddOnSlug ) => void;
	priceOnSeparateLine?: boolean;
};

type StorageDropdownOptionProps = {
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

const StorageDropdownOption = ( {
	planSlug,
	price,
	storageSlug,
	isLargeCurrency = false,
	priceOnSeparateLine,
}: StorageDropdownOptionProps ) => {
	const translate = useTranslate();
	const { siteId } = usePlansGridContext();
	const title = useStorageStringFromFeature( { storageSlug, siteId, planSlug } ) ?? '';

	return (
		<>
			{ price && ! isLargeCurrency && ! priceOnSeparateLine ? (
				<DropdownOption className="plans-grid-next-storage-dropdown__option" title={ title }>
					<span>
						{ translate(
							'{{priceSpan}}+{{nbsp/}}%(price)s{{/priceSpan}}{{perMonthSpan}}/month{{/perMonthSpan}}',
							{
								args: { price },
								components: {
									nbsp: <>&nbsp;</>,
									priceSpan: <span className="plans-grid-next-storage-dropdown__option-price" />,
									perMonthSpan: (
										<span className="plans-grid-next-storage-dropdown__option-per-month" />
									),
								},
								comment: 'The cost of a storage add on per month. Example reads as "+ $50/month"',
							}
						) }
					</span>
				</DropdownOption>
			) : (
				<span className="plans-grid-next-storage-dropdown__option-title">{ title }</span>
			) }
		</>
	);
};

const StorageDropdown = ( {
	planSlug,
	onStorageAddOnClick,
	priceOnSeparateLine = false,
}: StorageDropdownProps ) => {
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
				<StorageDropdownOption
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
			<StorageDropdownOption
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
				<div className="plans-grid-next-storage-dropdown__addon-offset-price-container">
					<span className="plans-grid-next-storage-dropdown__addon-offset-price">
						{ translate( '+ %(selectedOptionPrice)s/month', {
							args: { selectedOptionPrice },
						} ) }
					</span>
				</div>
			) }
		</>
	);
};

export default StorageDropdown;
