import { AddOns, WpcomPlansUI } from '@automattic/data-stores';
import { CustomSelectControl } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useCallback, useEffect, useMemo } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { usePlansGridContext } from '../../../grid-context';
import useDefaultStorageOption from '../../../hooks/data-store/use-default-storage-option';
import useIsLargeCurrency from '../../../hooks/use-is-large-currency';
import DropdownOption from '../../dropdown-option';
import useStorageStringFromFeature from '../hooks/use-storage-string-from-feature';
import type { PlanSlug, StorageOption, WPComStorageAddOnSlug } from '@automattic/calypso-products';
import type { AddOnMeta } from '@automattic/data-stores';

type StorageAddOnDropdownProps = {
	planSlug: PlanSlug;
	storageOptions: StorageOption[];
	onStorageAddOnClick?: ( addOnSlug: WPComStorageAddOnSlug ) => void;
	priceOnSeparateLine?: boolean;
};

type StorageAddOnOptionProps = {
	planSlug: PlanSlug;
	price?: string;
	storageFeature: string;
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
	planSlug,
	price,
	storageFeature,
	isLargeCurrency = false,
	priceOnSeparateLine,
}: StorageAddOnOptionProps ) => {
	const translate = useTranslate();
	const { siteId } = usePlansGridContext();
	const title = useStorageStringFromFeature( { storageFeature, siteId, planSlug } ) ?? '';

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

const StorageAddOnDropdown = ( {
	planSlug,
	storageOptions,
	onStorageAddOnClick,
	priceOnSeparateLine = false,
}: StorageAddOnDropdownProps ) => {
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

	const selectControlOptions = storageOptions.map( ( storageOption ) => {
		return {
			key: storageOption.slug,
			name: (
				<StorageAddOnOption
					planSlug={ planSlug }
					price={ getStorageOptionPrice( storageAddOns, storageOption.slug ) }
					storageFeature={ storageOption.slug }
				/>
			),
		};
	} );

	const selectedOptionPrice = getStorageOptionPrice( storageAddOns, selectedStorageOptionForPlan );

	const selectedOption = {
		key: selectedStorageOptionForPlan,
		name: (
			<StorageAddOnOption
				planSlug={ planSlug }
				price={ selectedOptionPrice }
				storageFeature={ selectedStorageOptionForPlan }
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

export default StorageAddOnDropdown;
