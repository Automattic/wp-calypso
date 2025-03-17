import { recordTracksEvent } from '@automattic/calypso-analytics';
import { AddOns } from '@automattic/data-stores';
import { PlanStorage as StorageDropdown } from '@automattic/plans-grid-next';
import { Modal, Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import StorageIndicator from './storage-indicator';

type AddStorageModalProps = {
	isOpen: boolean;
	onClose: () => void;
	onBuyStorage: () => void;
};

const AddStorageModal: React.FC< AddStorageModalProps > = ( { isOpen, onClose, onBuyStorage } ) => {
	const translate = useTranslate();

	const trackStorageAddOnClick = useCallback( ( addOnSlug: AddOns.StorageAddOnSlug ) => {
		recordTracksEvent( 'calypso_signup_storage_add_on_dropdown_option_click', {
			add_on_slug: addOnSlug,
		} );
	}, [] );

	return isOpen ? (
		<Modal title="Add more storage" onRequestClose={ onClose }>
			<p>{ translate( 'Make more space for high-quality photos, videos, and other media.' ) }</p>
			<StorageDropdown
				onStorageAddOnClick={ trackStorageAddOnClick }
				planSlug="business-bundle"
				showUpgradeableStorage
			/>
			<StorageIndicator />
			<Button isSecondary onClick={ onClose }>
				{ translate( 'Cancel' ) }
			</Button>
			<Button isPrimary onClick={ onBuyStorage }>
				{ translate( 'Buy storage' ) }
			</Button>
		</Modal>
	) : null;
};

export default AddStorageModal;
