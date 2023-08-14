import { recordTracksEvent } from '@automattic/calypso-analytics';
import { isEnabled } from '@automattic/calypso-config';
import { AddSubscriberForm } from '@automattic/subscriber';
import { Modal } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { LoadingBar } from 'calypso/components/loading-bar';
import { useSubscribersPage } from 'calypso/my-sites/subscribers/components/subscribers-page/subscribers-page-context';
import './style.scss';

type AddSubscribersModalProps = {
	siteId: number;
	siteTitle: string;
};

const AddSubscribersModal = ( { siteId, siteTitle }: AddSubscribersModalProps ) => {
	const translate = useTranslate();
	const { showAddSubscribersModal, setShowAddSubscribersModal, addSubscribersCallback } =
		useSubscribersPage();

	useEffect( () => {
		// Open "add subscribers" modal by default via URL
		if ( window.location.hash === '#add-subscribers' ) {
			setShowAddSubscribersModal( true );
		}
	}, [] );

	const modalTitle = translate( 'Add subscribers to %s', {
		args: [ siteTitle ],
		comment: "%s is the site's title",
	} );

	const [ isUploading, setIsUploading ] = useState( false );
	const onImportStarted = ( hasFile: boolean ) => setIsUploading( hasFile );
	const onImportFinished = () => {
		setIsUploading( false );
		addSubscribersCallback();
	};

	if ( ! showAddSubscribersModal ) {
		return null;
	}

	return (
		<Modal
			title={ modalTitle as string }
			onRequestClose={ () => setShowAddSubscribersModal( false ) }
			overlayClassName="add-subscribers-modal"
		>
			{ isUploading && (
				<>
					<LoadingBar progress={ 0.5 } />
					<span className="add-subscribers-modal__loading-text">
						{ translate( 'Uploading CSV file…' ) }
					</span>
				</>
			) }

			{ ! isUploading && (
				<label className="add-subscribers-modal__label">{ translate( 'Email' ) }</label>
			) }

			<AddSubscriberForm
				siteId={ siteId }
				submitBtnAlwaysEnable={ true }
				onImportStarted={ onImportStarted }
				onImportFinished={ onImportFinished }
				showTitle={ false }
				showSubtitle={ false }
				showCsvUpload={ isEnabled( 'subscriber-csv-upload' ) }
				recordTracksEvent={ recordTracksEvent }
				hidden={ isUploading }
			/>
		</Modal>
	);
};

export default AddSubscribersModal;
