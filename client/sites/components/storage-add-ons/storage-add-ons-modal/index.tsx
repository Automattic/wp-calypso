import page from '@automattic/calypso-router';
import { Site, StorageAddOnSlug, AddOns } from '@automattic/data-stores';
import { Modal, Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useStorageLimitOverride } from 'calypso/lib/plans/use-storage-limit-override';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { StorageAddOnsDropdown } from '../storage-add-ons-dropdown';
import StorageAddOnIndicator from '../storage-indicator';

import './style.scss';

type StorageAddOnsModalProps = {
	isOpen: boolean;
	onClose: () => void;
};

export default function StorageAddOnsModal( { isOpen, onClose }: StorageAddOnsModalProps ) {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );

	const { data: mediaStorage } = Site.useSiteMediaStorage( { siteIdOrSlug: siteId } );

	const availableStorageAddOns = AddOns.useAvailableStorageAddOns( { siteId } );
	const [ selectedStorageAddOnSlug, setSelectedStorageAddOnSlug ] =
		useState< StorageAddOnSlug | null >( null );
	const selectedStorageAddOn = availableStorageAddOns?.find(
		( addOn ) => addOn?.addOnSlug === selectedStorageAddOnSlug
	);

	const checkoutLink = AddOns.useAddOnCheckoutLink();
	const onBuyStorage = () => {
		onClose();

		const slug = selectedStorageAddOn?.productSlug ?? '';
		const quantity = selectedStorageAddOn?.quantity ?? 0;

		recordTracksEvent( 'calypso_storage_add_on_modal_action_primary_click', {
			add_on_slug_with_quantity: `${ slug }:${ quantity }`,
			add_on_slug: slug,
			quantity,
		} );
		page.redirect( `${ checkoutLink( siteId, slug, quantity ) }` );
	};

	const handleClose = () => {
		onClose();
		recordTracksEvent( 'calypso_storage_add_on_modal_action_cancel_click' );
	};

	const maxStorageBytesOverride = useStorageLimitOverride( {
		currentStorageBytes: mediaStorage?.maxStorageBytes,
		siteId,
	} );
	if ( mediaStorage && maxStorageBytesOverride ) {
		mediaStorage.maxStorageBytes = maxStorageBytesOverride;
	}

	if ( ! isOpen || ! siteId || ! mediaStorage ) {
		return null;
	}

	return (
		<Modal
			className="storage-add-ons-modal"
			title={ translate( 'Add more storage' ) }
			onRequestClose={ handleClose }
		>
			<span className="storage-add-ons-modal__description">
				{ translate( 'Make more space for high-quality photos, videos, and other media.' ) }
			</span>
			<StorageAddOnsDropdown
				selectedStorageAddOnSlug={ selectedStorageAddOnSlug }
				setSelectedStorageAddOnSlug={ setSelectedStorageAddOnSlug }
				siteId={ siteId }
			/>
			<div>
				<div className="storage-add-ons-modal__label">{ translate( 'New storage capacity' ) }</div>
				<StorageAddOnIndicator
					mediaStorage={ mediaStorage }
					selectedStorageAddOnSlug={ selectedStorageAddOnSlug }
					siteId={ siteId }
				/>
			</div>
			<div className="storage-add-ons-modal__buttons">
				<Button variant="tertiary" onClick={ handleClose }>
					{ translate( 'Cancel' ) }
				</Button>
				<Button variant="primary" onClick={ onBuyStorage }>
					{ translate( 'Buy storage' ) }
				</Button>
			</div>
		</Modal>
	);
}
