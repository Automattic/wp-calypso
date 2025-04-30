import { AddOns, Site, StorageAddOnSlug } from '@automattic/data-stores';
import { useGetPurchasedStorageAddOn } from '@automattic/data-stores/src/add-ons';
import { formatCurrency } from '@automattic/number-formatters';
import styled from '@emotion/styled';
import {
	Card,
	CardHeader,
	CardBody,
	CardFooter,
	CustomSelectControl,
	Button,
} from '@wordpress/components';
import { Icon } from '@wordpress/icons';
import filesize from 'filesize';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { SiteId } from 'calypso/types';

export interface Props {
	siteId: SiteId;
	actionPrimary?: ( productSlug: string, quantity?: number ) => void;
}

const Container = styled.div`
	.storage-add-ons-card {
		width: 100%;
		height: 100%;
		border-radius: 5px;

		> div {
			// @wordpress/components<Card> wraps content in a first inner div
			height: 100%;
			width: 100%;
			display: flex;
			flex-direction: column;
			box-sizing: border-box;
			padding: 8px 0;
		}
	}

	.storage-add-ons-card__header {
		display: flex;
		justify-content: flex-start;
		gap: 0.8em;

		.storage-add-ons-card__icon {
			display: flex;
		}

		.storage-add-ons-card__name-tag {
			display: flex;
			align-items: center;
			gap: 10px;

			.storage-add-ons-card__name {
				font-size: 1rem;
				font-weight: 500;
			}
		}

		.storage-add-ons-card__storage-used {
			margin-inline-start: auto;
			border-radius: 4px;
			font-size: small;
			background-color: var( --studio-gray-0 );
			padding: 8px 12px;
			font-weight: 600;
		}
	}

	.storage-add-ons-card__body {
		font-size: 0.875rem;
		padding-top: 0;
		padding-bottom: 0;

		.storage-add-ons-card__storage-dropdown {
			margin: 16px 0;

			.storage-add-ons-card__storage-dropdown-option {
				.storage-add-ons-card__storage-dropdown-option-storage {
					font-weight: 600;
				}

				.storage-add-ons-card__storage-dropdown-option-price {
					margin-inline-start: 4px;
					color: #757575;
				}
			}
		}
	}

	.storage-add-ons-card__footer {
		display: flex;
		margin-top: auto;

		.storage-add-ons-card__action-button {
			font-weight: 600;
			text-decoration: none;
			padding: 0;
		}
	}
`;

const StorageDropdownOption = ( {
	price,
	totalStorage,
}: {
	price: string | null;
	totalStorage: number;
} ) => {
	const translate = useTranslate();

	return (
		<>
			{ price ? (
				<div className="storage-add-ons-card__storage-dropdown-option">
					<span className="storage-add-ons-card__storage-dropdown-option-storage">
						{ translate( '+ %(totalStorage)dGB', { args: { totalStorage } } ) }
					</span>
					<span className="storage-add-ons-card__storage-dropdown-option-price">
						{ translate( '%(price)s/month, billed yearly', {
							args: { price },
							comment: 'The cost of a storage add on per month. Example reads as "$50/month"',
						} ) }
					</span>
				</div>
			) : null }
		</>
	);
};

export default function StorageAddOnCard( { siteId, actionPrimary }: Props ) {
	const translate = useTranslate();
	const { data: mediaStorage, isPending: isLoading } = Site.useSiteMediaStorage( {
		siteIdOrSlug: siteId,
	} );

	const used = filesize( mediaStorage?.storageUsedBytes || 0, { round: 0 } );
	const max = filesize( mediaStorage?.maxStorageBytes || 0, { round: 0 } );

	const purchasedStorageAddOn = useGetPurchasedStorageAddOn( { siteId } );
	const purchasedStorageAddOnQuantity = purchasedStorageAddOn?.quantity ?? 0;
	const purchasedStorageAddOnYearlyPrice = purchasedStorageAddOn?.prices?.yearlyPrice ?? 0;

	const storageAddOns = AddOns.useStorageAddOns( { siteId } );
	const availableStorageAddOns = AddOns.useAvailableStorageAddOns( { siteId } );

	const [ selectedStorageAddOnSlug, setSelectedStorageAddOnSlug ] =
		useState< StorageAddOnSlug | null >( null );
	const selectedStorageAddOn = storageAddOns?.find(
		( addOn ) => addOn?.addOnSlug === selectedStorageAddOnSlug
	);
	const selectedStorageAddOnStorageQuantity = selectedStorageAddOn?.quantity ?? 0;

	useEffect( () => {
		if ( availableStorageAddOns.length ) {
			setSelectedStorageAddOnSlug( availableStorageAddOns[ 0 ].addOnSlug as StorageAddOnSlug );
		}
	}, [ availableStorageAddOns ] );

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

	function handleOnChange( { selectedItem }: { selectedItem: { key: string } } ) {
		const addOnSlug = selectedItem?.key as AddOns.StorageAddOnSlug;

		if ( addOnSlug ) {
			setSelectedStorageAddOnSlug( addOnSlug );
		}
	}

	const onActionPrimary = () => {
		actionPrimary?.(
			availableStorageAddOns[ 0 ]?.productSlug,
			selectedStorageAddOnStorageQuantity
		);
	};

	return (
		<Container>
			<Card className="storage-add-ons-card">
				<CardHeader isBorderless className="storage-add-ons-card__header">
					<div className="storage-add-ons-card__icon">
						{ storageAddOns?.[ 0 ]?.icon && <Icon icon={ storageAddOns[ 0 ].icon } size={ 44 } /> }
					</div>
					<div className="storage-add-ons-card__name-tag">
						<div className="storage-add-ons-card__name">{ translate( 'Storage' ) }</div>
					</div>
					<div className="storage-add-ons-card__storage-used">
						{ isLoading
							? null
							: translate( 'Using %(usedStorage)s of %(maxStorage)s', {
									args: {
										usedStorage: used,
										maxStorage: max,
									},
									comment:
										'Describes used vs available storage amounts (e.g., Using 20 GB of 30GB, Using 12 MB of 20GB)',
							  } ) }
					</div>
				</CardHeader>
				<CardBody className="storage-add-ons-card__body">
					{ translate( 'Make more space for high-quality photos, videos, and other media.' ) }
					{ selectControlOptions.length ? (
						<div className="storage-add-ons-card__storage-dropdown">
							<CustomSelectControl
								__next40pxDefaultSize
								hideLabelFromVision
								options={ selectControlOptions || [] }
								// @ts-expect-error ts complains about selectedOption possibly being null
								value={ selectedOption }
								onChange={ handleOnChange }
								label=""
							/>
						</div>
					) : null }
				</CardBody>
				<CardFooter isBorderless className="storage-add-ons-card__footer">
					{ Boolean( selectControlOptions.length ) && actionPrimary && (
						<Button onClick={ onActionPrimary } variant="primary">
							{ translate( 'Buy add-on' ) }
						</Button>
					) }
				</CardFooter>
			</Card>
		</Container>
	);
}
