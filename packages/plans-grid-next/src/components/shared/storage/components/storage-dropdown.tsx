import { AddOns, WpcomPlansUI } from '@automattic/data-stores';
import { CustomSelectControl } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useCallback, useEffect, useMemo } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { usePlansGridContext } from '../../../../grid-context';
import useIsLargeCurrency from '../../../../hooks/use-is-large-currency';
import DropdownOption from '../../../dropdown-option';
import useDefaultStorageOption from '../hooks/use-default-storage-option';
import usePlanStorage from '../hooks/use-plan-storage';
import useStorageString from '../hooks/use-storage-string';
import type { PlanSlug } from '@automattic/calypso-products';

type StorageDropdownProps = {
	planSlug: PlanSlug;
	onStorageAddOnClick?: ( addOnSlug: AddOns.StorageAddOnSlug ) => void;
	priceOnSeparateLine?: boolean;
};

type StorageDropdownOptionProps = {
	price?: string;
	totalStorage: number;
	isLargeCurrency?: boolean;
	priceOnSeparateLine?: boolean;
};

const getSelectedStorageAddOn = (
	storageAddOnsForPlan: ( AddOns.AddOnMeta | null )[] | null,
	storageOptionSlug: string
) => {
	return storageAddOnsForPlan?.find( ( addOn ) => addOn?.addOnSlug === storageOptionSlug );
};

const StorageDropdownOption = ( {
	price,
	totalStorage,
	isLargeCurrency = false,
	priceOnSeparateLine,
}: StorageDropdownOptionProps ) => {
	const translate = useTranslate();
	const title = useStorageString( totalStorage );

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
	const availableStorageAddOns = AddOns.useAvailableStorageAddOns( { siteId } );
	const planStorage = usePlanStorage( planSlug );

	useEffect( () => {
		if ( ! selectedStorageOptionForPlan ) {
			defaultStorageOption &&
				setSelectedStorageOptionForPlan( {
					addOnSlug: defaultStorageOption,
					planSlug,
					siteId,
				} );
		}
	}, [
		defaultStorageOption,
		planSlug,
		selectedStorageOptionForPlan,
		setSelectedStorageOptionForPlan,
		siteId,
	] );

	const defaultStorageItem = useMemo(
		() => ( {
			key: defaultStorageOption || '',
			name: (
				<StorageDropdownOption price="" totalStorage={ planStorage } />
			 ) as unknown as string,
		} ),
		[ defaultStorageOption, planStorage ]
	);

	const selectControlOptions = [ defaultStorageItem ].concat(
		availableStorageAddOns?.map( ( addOn ) => {
			const addOnStorage = addOn.quantity ?? 0;

			return {
				key: addOn.addOnSlug,
				name: (
					<StorageDropdownOption
						price={ addOn?.prices?.formattedMonthlyPrice }
						totalStorage={ planStorage + addOnStorage }
					/>
				 ) as unknown as string,
			};
		} )
	);

	const selectedStorageAddOn = getSelectedStorageAddOn(
		storageAddOns,
		selectedStorageOptionForPlan
	);
	const selectedStorageAddOnStorage = selectedStorageAddOn?.quantity ?? 0;

	const selectedOption = {
		key: selectedStorageOptionForPlan,
		name: (
			<StorageDropdownOption
				price={ selectedStorageAddOn?.prices?.formattedMonthlyPrice }
				totalStorage={ planStorage + selectedStorageAddOnStorage }
				isLargeCurrency={ isLargeCurrency }
				priceOnSeparateLine={ priceOnSeparateLine }
			/>
		 ) as unknown as string,
	};

	const handleOnChange = useCallback(
		( { selectedItem }: { selectedItem: { key: string } } ) => {
			const addOnSlug = selectedItem?.key as AddOns.StorageAddOnSlug;

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
				options={ selectControlOptions || [] }
				value={ selectedOption }
				onChange={ handleOnChange }
				label=""
			/>
			{ selectedStorageAddOn?.prices?.formattedMonthlyPrice &&
				( isLargeCurrency || priceOnSeparateLine ) && (
					<div className="plans-grid-next-storage-dropdown__addon-offset-price-container">
						<span className="plans-grid-next-storage-dropdown__addon-offset-price">
							{ translate( '+ %(selectedOptionPrice)s/month', {
								args: { selectedOptionPrice: selectedStorageAddOn?.prices?.formattedMonthlyPrice },
							} ) }
						</span>
					</div>
				) }
		</>
	);
};

export default StorageDropdown;
