import { AddOns, StorageAddOnSlug } from '@automattic/data-stores';
import { useGetPurchasedStorageAddOn } from '@automattic/data-stores/src/add-ons';
import { formatCurrency } from '@automattic/number-formatters';
import { CustomSelectControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect } from 'react';

import './style.scss';

const StorageDropdownOption = ( {
	price,
	totalStorage,
}: {
	price: string | null;
	totalStorage: number;
} ) => {
	const translate = useTranslate();

	if ( ! price ) {
		return null;
	}

	return (
		<div className="storage-add-ons-dropdown__option">
			<span className="storage-add-ons-dropdown__option--storage">
				{ translate( '%(totalStorage)d GB Storage', { args: { totalStorage } } ) }
			</span>
			<span className="storage-add-ons-dropdown__option--price">
				{ translate( '(%(price)s/month, billed yearly)', {
					args: { price },
					comment: 'The cost of a storage add on per month. Example reads as "$50/month"',
				} ) }
			</span>
		</div>
	);
};

export const StorageAddOnsDropdown = ( {
	siteId,
	selectedStorageAddOnSlug,
	setSelectedStorageAddOnSlug,
}: {
	siteId: number;
	selectedStorageAddOnSlug: StorageAddOnSlug | null;
	setSelectedStorageAddOnSlug: ( slug: StorageAddOnSlug ) => void;
} ) => {
	const translate = useTranslate();
	const storageAddOns = AddOns.useStorageAddOns( { siteId } );
	const selectedStorageAddOn = storageAddOns?.find(
		( addOn ) => addOn?.addOnSlug === selectedStorageAddOnSlug
	);
	const selectedStorageAddOnStorageQuantity = selectedStorageAddOn?.quantity ?? 0;
	const availableStorageAddOns = AddOns.useAvailableStorageAddOns( { siteId } );
	const purchasedStorageAddOn = useGetPurchasedStorageAddOn( { siteId } );
	const purchasedStorageAddOnQuantity = purchasedStorageAddOn?.quantity ?? 0;
	const purchasedStorageAddOnYearlyPrice = purchasedStorageAddOn?.prices?.yearlyPrice ?? 0;

	useEffect( () => {
		if ( availableStorageAddOns.length ) {
			setSelectedStorageAddOnSlug( availableStorageAddOns[ 0 ].addOnSlug as StorageAddOnSlug );
		}
	}, [ availableStorageAddOns, setSelectedStorageAddOnSlug ] );

	const selectControlOptions = availableStorageAddOns?.map( ( addOn ) => {
		const addOnStorage = addOn.quantity ?? 0;

		const price =
			addOn?.prices?.yearlyPrice && addOn?.prices?.currencyCode
				? formatCurrency(
						( ( addOn.prices.yearlyPrice || 0 ) - purchasedStorageAddOnYearlyPrice ) / 12,
						addOn.prices.currencyCode,
						{ isSmallestUnit: true }
				  )
				: null;

		return {
			key: addOn.addOnSlug,
			name: (
				<StorageDropdownOption
					price={ price }
					totalStorage={ addOnStorage - purchasedStorageAddOnQuantity }
				/>
			 ) as unknown as string,
		};
	} );

	const selectedOptionPrice =
		selectedStorageAddOn?.prices?.yearlyPrice && selectedStorageAddOn?.prices?.currencyCode
			? formatCurrency(
					( ( selectedStorageAddOn.prices.yearlyPrice || 0 ) - purchasedStorageAddOnYearlyPrice ) /
						12,
					selectedStorageAddOn.prices.currencyCode,
					{ isSmallestUnit: true }
			  )
			: null;
	const selectedOption = {
		key: selectedStorageAddOnSlug,
		name: (
			<StorageDropdownOption
				price={ selectedOptionPrice }
				totalStorage={ selectedStorageAddOnStorageQuantity - purchasedStorageAddOnQuantity }
			/>
		 ) as unknown as string,
	};

	const handleOnChange = useCallback(
		( { selectedItem }: { selectedItem: { key: string } } ) => {
			const addOnSlug = selectedItem?.key as AddOns.StorageAddOnSlug;

			if ( addOnSlug ) {
				setSelectedStorageAddOnSlug( addOnSlug );
			}
		},
		[ setSelectedStorageAddOnSlug ]
	);

	return (
		<CustomSelectControl
			label={ translate( 'Storage add-on' ) }
			options={ selectControlOptions || [] }
			// @ts-expect-error ts complains about selectedOption possibly being null
			value={ selectedOption }
			onChange={ handleOnChange }
		/>
	);
};
