import page from '@automattic/calypso-router';
import { Site, StorageAddOnSlug, AddOns } from '@automattic/data-stores';
// eslint-disable-next-line wpcalypso/no-unsafe-wp-apis
import { __experimentalConfirmDialog as ConfirmDialog } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useStorageLimitOverride } from 'calypso/lib/plans/use-storage-limit-override';
import { StorageAddOnDropdown } from './dropdown';
import StorageAddOnIndicator from './storage-indicator';

type StorageAddOnModalProps = {
	isOpen: boolean;
	siteId: number;
	setIsOpen: ( isOpen: boolean ) => void;
};

const StorageAddOnModal: React.FC< StorageAddOnModalProps > = ( { isOpen, siteId, setIsOpen } ) => {
	const translate = useTranslate();
	const { data: mediaStorage } = Site.useSiteMediaStorage( { siteIdOrSlug: siteId } );

	const [ selectedStorageAddOnSlug, setSelectedStorageAddOnSlug ] =
		useState< StorageAddOnSlug | null >( null );
	const checkoutLink = AddOns.useAddOnCheckoutLink();
	const onBuyStorage = () => {
		setIsOpen( false );
		recordTracksEvent( 'calypso_storage_add_on_modal_action_primary_click', {
			add_on_slug_with_quantity: `${ selectedStorageAddOnSlug }:1`,
			add_on_slug: selectedStorageAddOnSlug,
			quantity: 1,
		} );
		page.redirect( `${ checkoutLink( siteId, selectedStorageAddOnSlug ?? '', 1 ) }` );
	};
	const onClose = () => {
		setIsOpen( false );
		recordTracksEvent( 'calypso_storage_add_on_modal_action_cancel_click' );
	};

	useEffect( () => {
		if ( isOpen ) {
			recordTracksEvent( 'calypso_storage_add_on_modal_open' );
		}
	}, [ isOpen ] );

	const maxStorageBytesOverride = useStorageLimitOverride( {
		currentStorageBytes: mediaStorage?.maxStorageBytes,
		siteId,
	} );
	if ( mediaStorage ) {
		mediaStorage.maxStorageBytes = maxStorageBytesOverride;
	}

	if ( ! mediaStorage ) {
		return null;
	}

	return isOpen ? (
		<ConfirmDialog
			title="Add more storage"
			onRequestClose={ onClose }
			cancelButtonText={ translate( 'Cancel' ) }
			confirmButtonText={ translate( 'Buy storage' ) }
			onCancel={ onClose }
			onConfirm={ onBuyStorage }
		>
			<p>{ translate( 'Make more space for high-quality photos, videos, and other media.' ) }</p>
			<h2>{ translate( 'Storage Add-ON' ) }</h2>
			<StorageAddOnDropdown
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
		</ConfirmDialog>
	) : null;
};

export default StorageAddOnModal;
