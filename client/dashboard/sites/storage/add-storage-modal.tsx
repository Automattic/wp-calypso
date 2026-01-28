import { productsQuery, siteMediaStorageQuery, sitePurchasesQuery } from '@automattic/api-queries';
import { formatCurrency } from '@automattic/number-formatters';
import { useQuery } from '@tanstack/react-query';
import {
	Modal,
	Button,
	Spinner,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	CustomSelectControl,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import filesize from 'filesize';
import { useState } from 'react';
import { getCurrentDashboard, redirectToDashboardLink, wpcomLink } from '../../utils/link';
import { StorageCapacityStat } from './storage-capacity-stat';
import {
	getStorageAddOnProduct,
	getPurchasedStorageAddOn,
	getStorageTierOptions,
	getPurchasedStorageQuantity,
	getStorageTierYearlyPrice,
	type StorageTierOption,
} from './storage-utils';
import type { Site } from '@automattic/api-core';

interface AddStorageModalProps {
	site: Site;
	isOpen: boolean;
	onClose: () => void;
}

interface SelectOption {
	key: string;
	name: string;
}

export function AddStorageModal( { site, isOpen, onClose }: AddStorageModalProps ) {
	const { data: products, isLoading: isLoadingProducts } = useQuery( productsQuery() );
	const { data: purchases, isLoading: isLoadingPurchases } = useQuery(
		sitePurchasesQuery( site.ID )
	);
	const { data: mediaStorage, isLoading: isLoadingStorage } = useQuery(
		siteMediaStorageQuery( site.ID )
	);

	const [ userSelectedTier, setUserSelectedTier ] = useState< StorageTierOption | null >( null );

	if ( ! isOpen ) {
		return null;
	}

	const isLoading = isLoadingProducts || isLoadingPurchases || isLoadingStorage;

	if ( isLoading || ! products || ! purchases || ! mediaStorage ) {
		return (
			<Modal title={ __( 'Add more storage' ) } onRequestClose={ onClose }>
				<VStack spacing={ 4 } alignment="center">
					<Spinner />
				</VStack>
			</Modal>
		);
	}

	const storageProduct = getStorageAddOnProduct( products );
	const purchasedStorageAddOn = getPurchasedStorageAddOn( purchases );
	const tierOptions = getStorageTierOptions( storageProduct );
	const currentPurchasedQuantity = getPurchasedStorageQuantity( purchasedStorageAddOn );
	const currentPurchasedYearlyPrice = getStorageTierYearlyPrice(
		tierOptions,
		currentPurchasedQuantity
	);

	// Filter out tiers that are less than or equal to what's already purchased
	const availableTiers = tierOptions.filter( ( tier ) => tier.quantity > currentPurchasedQuantity );

	const selectedTier = userSelectedTier ?? availableTiers[ 0 ] ?? null;

	// Calculate storage breakdown
	const planStorageBytes =
		mediaStorage.max_storage_bytes - mediaStorage.max_storage_bytes_from_add_ons;
	const selectedAddOnStorageBytes = ( selectedTier?.quantity ?? 0 ) * 1024 * 1024 * 1024;

	// Build select options - show additional storage and incremental price.
	// That is, it is presented as the user choosing further additional amounts rather than choosing a new total storage.
	// e.g. if they have 50gb the list shows +50gb, +100gb, +200gb, +250gb, +300gb rather than 100gb, 150gb, 250gb, 300gb, 350gb.
	// Functionally, this is the same but it emphasises what extra they're getting and how much more it'll cost them today, pro-rating their previous upgrade.
	const selectOptions: SelectOption[] = availableTiers.map( ( tier ) => {
		const additionalGB = tier.quantity - currentPurchasedQuantity;
		const incrementalMonthlyPrice = ( tier.yearlyPrice - currentPurchasedYearlyPrice ) / 12;
		const formattedIncrementalPrice = formatCurrency( incrementalMonthlyPrice, tier.currencyCode, {
			isSmallestUnit: true,
		} );

		return {
			key: String( tier.quantity ),
			name: sprintf(
				// translators: %1$d: additional storage amount in GB, %2$s: formatted cost of additional storage, e.g., "+ 50 GB Storage (£40.71/month, billed yearly)"
				__( '+ %1$d GB Storage (%2$s/month, billed yearly)' ),
				additionalGB,
				formattedIncrementalPrice
			),
		};
	} );

	const selectedOption =
		selectOptions.find( ( option ) => option.key === String( selectedTier?.quantity ) ) ||
		selectOptions[ 0 ];

	const handleSelectChange = ( { selectedItem }: { selectedItem: SelectOption } ) => {
		const tier = tierOptions.find( ( t ) => String( t.quantity ) === selectedItem.key );
		if ( tier ) {
			setUserSelectedTier( tier );
		}
	};

	const handleBuyStorage = () => {
		if ( ! selectedTier ) {
			return;
		}

		const backUrl = redirectToDashboardLink( { supportBackport: true } );
		const checkoutUrl = addQueryArgs(
			wpcomLink(
				`/checkout/${ site.slug }/${ storageProduct.product_slug }:-q-${ selectedTier.quantity }`
			),
			{
				cancel_to: backUrl,
				return_to: backUrl,
				dashboard: getCurrentDashboard(),
			}
		);

		window.location.href = checkoutUrl;
	};

	return (
		<Modal title={ __( 'Add more storage' ) } onRequestClose={ onClose }>
			<VStack spacing={ 4 }>
				<Text>{ __( 'Make more space for high-quality photos, videos, and other media.' ) }</Text>

				<VStack spacing={ 2 }>
					<Text weight={ 600 }>{ __( 'Storage add-on' ) }</Text>
					<CustomSelectControl
						__next40pxDefaultSize
						hideLabelFromVision
						label={ __( 'Select storage amount' ) }
						options={ selectOptions }
						value={ selectedOption }
						onChange={ handleSelectChange }
					/>
				</VStack>

				<VStack spacing={ 2 }>
					<Text weight={ 600 }>{ __( 'New storage capacity' ) }</Text>
					<StorageCapacityStat
						description={ filesize( mediaStorage.storage_used_bytes, { round: 0 } ) + ' used' }
						currentCapacityBytes={ planStorageBytes }
						addOnCapacityBytes={ selectedAddOnStorageBytes }
					/>
				</VStack>

				<VStack spacing={ 2 } direction="row" justify="flex-end">
					<Button __next40pxDefaultSize variant="tertiary" onClick={ onClose }>
						{ __( 'Cancel' ) }
					</Button>
					<Button
						__next40pxDefaultSize
						variant="primary"
						onClick={ handleBuyStorage }
						disabled={ ! selectedTier }
					>
						{ __( 'Buy storage' ) }
					</Button>
				</VStack>
			</VStack>
		</Modal>
	);
}
