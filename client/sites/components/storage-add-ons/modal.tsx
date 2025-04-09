import page from '@automattic/calypso-router';
import { Site, StorageAddOnSlug, AddOns } from '@automattic/data-stores';
import { Modal, __experimentalVStack as VStack, Flex, Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useStorageLimitOverride } from 'calypso/lib/plans/use-storage-limit-override';
import { StorageAddOnsDropdown } from './dropdown';
import StorageAddOnIndicator from './storage-indicator';

type StorageAddOnsModalProps = {
	isOpen: boolean;
	siteId: number;
	setIsOpen: ( isOpen: boolean ) => void;
};

const StorageAddOnsModal: React.FC< StorageAddOnsModalProps > = ( {
	isOpen,
	siteId,
	setIsOpen,
} ) => {
	const translate = useTranslate();
	const { data: mediaStorage } = Site.useSiteMediaStorage( { siteIdOrSlug: siteId } );

	const availableStorageAddOns = AddOns.useAvailableStorageAddOns( { siteId } );
	const [ selectedStorageAddOnSlug, setSelectedStorageAddOnSlug ] =
		useState< StorageAddOnSlug | null >( null );
	const selectedStorageAddOn = availableStorageAddOns?.find(
		( addOn ) => addOn?.addOnSlug === selectedStorageAddOnSlug
	);

	const checkoutLink = AddOns.useAddOnCheckoutLink();
	const onBuyStorage = () => {
		setIsOpen( false );

		const slug = selectedStorageAddOn?.productSlug ?? '';
		const quantity = selectedStorageAddOn?.quantity ?? 0;

		recordTracksEvent( 'calypso_storage_add_on_modal_action_primary_click', {
			add_on_slug_with_quantity: `${ slug }:${ quantity }`,
			add_on_slug: slug,
			quantity,
		} );
		page.redirect( `${ checkoutLink( siteId, slug, quantity ) }` );
	};

	const onClose = () => {
		setIsOpen( false );
		recordTracksEvent( 'calypso_storage_add_on_modal_action_cancel_click' );
	};

	const maxStorageBytesOverride = useStorageLimitOverride( {
		currentStorageBytes: mediaStorage?.maxStorageBytes,
		siteId,
	} );
	if ( mediaStorage && maxStorageBytesOverride ) {
		mediaStorage.maxStorageBytes = maxStorageBytesOverride;
	}

	if ( ! mediaStorage ) {
		return null;
	}

	return isOpen ? (
		<Modal title={ translate( 'Add more storage' ) } onRequestClose={ onClose }>
			<VStack spacing={ 8 }>
				<div>
					<p>
						{ translate( 'Make more space for high-quality photos, videos, and other media.' ) }
					</p>
					<h2>{ translate( 'Storage add-on' ) }</h2>
					<StorageAddOnsDropdown
						selectedStorageAddOnSlug={ selectedStorageAddOnSlug }
						setSelectedStorageAddOnSlug={ setSelectedStorageAddOnSlug }
						siteId={ siteId }
					/>
					<h2>{ translate( 'New storage capacity' ) }</h2>
					<StorageAddOnIndicator
						mediaStorage={ mediaStorage }
						selectedStorageAddOnSlug={ selectedStorageAddOnSlug }
						siteId={ siteId }
					/>
				</div>
				<Flex direction="row" justify="flex-end">
					<Button __next40pxDefaultSize variant="tertiary" onClick={ onClose }>
						{ translate( 'Cancel' ) }
					</Button>
					<Button __next40pxDefaultSize variant="primary" onClick={ onBuyStorage }>
						{ translate( 'Buy storage' ) }
					</Button>
				</Flex>
			</VStack>
		</Modal>
	) : null;
};

export default StorageAddOnsModal;
