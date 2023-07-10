import { recordTracksEvent } from '@automattic/calypso-analytics';
import { isEnabled } from '@automattic/calypso-config';
import { useLocale } from '@automattic/i18n-utils';
import { AddSubscriberForm } from '@automattic/subscriber';
import { Modal } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n/';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { LoadingBar } from 'calypso/components/loading-bar';
import './style.scss';

type AddSubscribersModalProps = {
	siteId: number;
	siteTitle: string;
	showModal: boolean;
	onClose: () => void;
	onAddFinished: () => void;
};

const AddSubscribersModal = ( {
	siteId,
	siteTitle,
	showModal,
	onClose,
	onAddFinished,
}: AddSubscribersModalProps ) => {
	const translate = useTranslate();
	const locale = useLocale();
	const { hasTranslation } = useI18n();

	const modalTitle =
		locale.startsWith( 'en' ) || hasTranslation( 'Add subscribers to %s' )
			? translate( 'Add subscribers to %s', {
					args: [ siteTitle ],
					comment: "%s is the site's title",
			  } )
			: translate( 'Add subscribers' );

	const [ isUploading, setIsUploading ] = useState( false );
	const onImportStarted = ( hasFile: boolean ) => setIsUploading( hasFile );
	const onImportFinished = () => {
		setIsUploading( false );
		onAddFinished();
	};

	if ( ! showModal ) {
		return null;
	}

	return (
		<Modal
			title={ modalTitle as string }
			onRequestClose={ onClose }
			overlayClassName="add-subscribers-modal"
		>
			{ isUploading && (
				<>
					<LoadingBar progress={ 0.5 } />
					<span className="add-subscribers-modal__loading-text">
						{ ( locale.startsWith( 'en' ) || hasTranslation( 'Uploading CSV file…' ) ) &&
							translate( 'Uploading CSV file…' ) }
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
