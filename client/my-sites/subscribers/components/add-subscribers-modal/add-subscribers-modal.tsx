import { recordTracksEvent } from '@automattic/calypso-analytics';
import { isEnabled } from '@automattic/calypso-config';
import { SiteDetails } from '@automattic/data-stores';
import { AddSubscriberForm } from '@automattic/subscriber';
import { Modal } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { LoadingBar } from 'calypso/components/loading-bar';
import { useSubscribersPage } from 'calypso/my-sites/subscribers/components/subscribers-page/subscribers-page-context';
import { isBusinessTrialSite } from 'calypso/sites-dashboard/utils';
import './style.scss';

type AddSubscribersModalProps = {
	site: SiteDetails;
};

const AddSubscribersModal = ( { site }: AddSubscribersModalProps ) => {
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
		args: [ site.title ],
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

	const isFreeSite = site?.plan?.is_free ?? false;
	const isBusinessTrial = site ? isBusinessTrialSite( site ) : false;
	const hasSubscriberLimit = isFreeSite || isBusinessTrial;

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
				siteId={ site.ID }
				hasSubscriberLimit={ hasSubscriberLimit }
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
