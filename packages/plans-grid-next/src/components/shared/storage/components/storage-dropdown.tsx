import { type AddOnMeta, AddOns, WpcomPlansUI } from '@automattic/data-stores';
import { CustomSelectControl } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useCallback, useEffect, useMemo } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { usePlansGridContext } from '../../../../grid-context';
import DropdownOption from '../../../dropdown-option';
import useDefaultStorageOption from '../hooks/use-default-storage-option';
import usePlanStorage from '../hooks/use-plan-storage';
import useStorageString from '../hooks/use-storage-string';
import type { PlanSlug, WPComPlanStorageFeatureSlug } from '@automattic/calypso-products';

type StorageDropdownProps = {
	planSlug: PlanSlug;
	onStorageAddOnClick?: ( addOnSlug: AddOns.StorageAddOnSlug ) => void;
};

type StorageDropdownOptionProps = {
	price?: string;
	planStorage: number;
	addOnStorage?: number;
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
	planStorage,
	addOnStorage,
	priceOnSeparateLine,
}: StorageDropdownOptionProps ) => {
	const translate = useTranslate();
	const planStorageString = useStorageString( planStorage );
	const addOnStorageString = useStorageString( addOnStorage || 0 );

	const title = addOnStorage
		? translate( '%(planStorageString)s + %(addOnStorageString)s', {
				args: {
					planStorageString,
					addOnStorageString,
				},
		  } )
		: planStorageString;

	const priceString =
		price && addOnStorage
			? translate( '%(price)s/month, billed yearly', {
					args: { price },
					comment:
						'The cost of a storage add on per month. Example reads as "$50/month, billed yearly"',
			  } )
			: translate( 'Included in plan' );

	return priceOnSeparateLine ? (
		<span className="plans-grid-next-storage-dropdown__option-title">{ title }</span>
	) : (
		<DropdownOption className="plans-grid-next-storage-dropdown__option" title={ title }>
			<div>{ priceString }</div>
		</DropdownOption>
	);
};

const StorageDropdown = ( { planSlug, onStorageAddOnClick }: StorageDropdownProps ) => {
	const translate = useTranslate();
	const { siteId } = usePlansGridContext();

	const { setSelectedStorageOptionForPlan } = useDispatch( WpcomPlansUI.store );
	const storageAddOns = AddOns.useStorageAddOns( { siteId } );

	const selectedStorageOptionForPlan = useSelect(
		( select ) => select( WpcomPlansUI.store ).getSelectedStorageOptionForPlan( planSlug, siteId ),
		[ planSlug, siteId ]
	);
	const defaultStorageOptionSlug = useDefaultStorageOption( { planSlug } );
	const availableStorageAddOns = AddOns.useAvailableStorageAddOns( { siteId } );
	const planStorage = usePlanStorage( planSlug );

	useEffect( () => {
		if ( ! selectedStorageOptionForPlan ) {
			defaultStorageOptionSlug &&
				setSelectedStorageOptionForPlan( {
					addOnSlug: defaultStorageOptionSlug,
					planSlug,
					siteId,
				} );
		}
	}, [
		defaultStorageOptionSlug,
		planSlug,
		selectedStorageOptionForPlan,
		setSelectedStorageOptionForPlan,
		siteId,
	] );

	const selectControlOptions = useMemo( () => {
		// Get the default storage add-on meta or the storage included with the plan
		let defaultStorageAddOnMeta:
			| AddOnMeta
			| {
					addOnSlug: AddOns.StorageAddOnSlug | WPComPlanStorageFeatureSlug;
					prices: AddOnMeta[ 'prices' ] | null;
					quantity: AddOnMeta[ 'quantity' ];
			  }
			| undefined
			| null = getSelectedStorageAddOn( storageAddOns, defaultStorageOptionSlug || '' );

		// If the default storage add-on is not available, create a new object with the default storage option slug
		if ( ! defaultStorageAddOnMeta && defaultStorageOptionSlug ) {
			defaultStorageAddOnMeta = { addOnSlug: defaultStorageOptionSlug, prices: null, quantity: 0 };
		}

		return [ defaultStorageAddOnMeta, ...availableStorageAddOns ]?.map( ( addOn ) => {
			const addOnStorage = addOn?.quantity ?? 0;

			return {
				key: addOn?.addOnSlug || '',
				name: (
					<StorageDropdownOption
						price={ addOn?.prices?.formattedMonthlyPrice }
						planStorage={ planStorage }
						addOnStorage={ addOnStorage }
					/>
				 ) as unknown as string,
			};
		} );
	}, [ availableStorageAddOns, defaultStorageOptionSlug, planStorage, storageAddOns ] );

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
				planStorage={ planStorage }
				addOnStorage={ selectedStorageAddOnStorage }
				priceOnSeparateLine
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
				__next40pxDefaultSize
				hideLabelFromVision
				options={ selectControlOptions || [] }
				value={ selectedOption }
				onChange={ handleOnChange }
				label=""
			/>
			{ selectedStorageAddOn?.prices?.formattedMonthlyPrice && (
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
