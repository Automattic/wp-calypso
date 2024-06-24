import { recordTracksEvent } from '@automattic/calypso-analytics';
import { isEnabled } from '@automattic/calypso-config';
import { FEATURE_UNLIMITED_SUBSCRIBERS } from '@automattic/calypso-products';
import { Gridicon } from '@automattic/components';
import { SiteDetails } from '@automattic/data-stores';
import { localizeUrl } from '@automattic/i18n-utils';
import { AddSubscriberForm } from '@automattic/subscriber';
import { useHasStaleImportJobs } from '@automattic/subscriber/src/hooks/use-has-stale-import-jobs';
import { useInProgressState } from '@automattic/subscriber/src/hooks/use-in-progress-state';
import { Modal } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { LoadingBar } from 'calypso/components/loading-bar';
import Notice from 'calypso/components/notice';
import { useSubscribersPage } from 'calypso/my-sites/subscribers/components/subscribers-page/subscribers-page-context';
import { isBusinessTrialSite } from 'calypso/sites-dashboard/utils';
import './style.scss';
import { useSelector } from 'calypso/state';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { AppState } from 'calypso/types';

type AddSubscribersModalProps = {
	site: SiteDetails;
};

const AddSubscribersModal = ( { site }: AddSubscribersModalProps ) => {
	const translate = useTranslate();
	const { showAddSubscribersModal, setShowAddSubscribersModal, addSubscribersCallback } =
		useSubscribersPage();
	const hasUnlimitedSubscribers = useSelector( ( state: AppState ) =>
		siteHasFeature( state, site?.ID, FEATURE_UNLIMITED_SUBSCRIBERS )
	);

	useEffect( () => {
		const handleHashChange = () => {
			// Open "add subscribers" via URL hash
			if ( window.location.hash === '#add-subscribers' ) {
				setShowAddSubscribersModal( true );
			}
		};

		// Listen to the hashchange event
		window.addEventListener( 'hashchange', handleHashChange );

		// Make it work on load as well
		handleHashChange();

		return () => {
			window.removeEventListener( 'hashchange', handleHashChange );
		};
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

	const isImportInProgress = useInProgressState();
	const hasStaleImportJobs = useHasStaleImportJobs();

	if ( ! showAddSubscribersModal ) {
		return null;
	}

	const isFreeSite = site?.plan?.is_free ?? false;
	const isBusinessTrial = site ? isBusinessTrialSite( site ) : false;
	const hasSubscriberLimit = ( isFreeSite || isBusinessTrial ) && ! hasUnlimitedSubscribers;
	const isWPCOMSite = ! site?.jetpack || site?.is_wpcom_atomic;
	const supportLink = site?.jetpack
		? localizeUrl( 'https://jetpack.com/contact-support' )
		: localizeUrl( 'https://wordpress.com/support/help-support-options' );

	return (
		<Modal
			title={ modalTitle as string }
			onRequestClose={ () => {
				if ( window.location.hash === '#add-subscribers' ) {
					// Doing this instead of window.location.hash = '' because window.location.hash keeps the # symbol
					// Also this makes the back button show the modal again, which is neat
					history.pushState(
						'',
						document.title,
						window.location.pathname + window.location.search
					);
				}
				setShowAddSubscribersModal( false );
			} }
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

			{ ! isUploading && isImportInProgress && ! hasStaleImportJobs && (
				<Notice
					className="add-subscribers-modal__notice"
					icon={ <Gridicon icon="info" /> }
					isCompact
					isReskinned
					status="is-info"
					showDismiss={ false }
				>
					<span className="add-subscribers-modal__notice-text">
						{ translate(
							'Your subscribers are being imported. This may take a few minutes. You can close this window and we’ll notify you when the import is complete.'
						) }
					</span>
				</Notice>
			) }

			{ ! isUploading && isImportInProgress && hasStaleImportJobs && (
				<Notice
					className="add-subscribers-modal__notice"
					icon={ <Gridicon icon="notice" /> }
					isCompact
					isReskinned
					status="is-warning"
					showDismiss={ false }
				>
					<span className="add-subscribers-modal__notice-text">
						{ translate(
							'Your recent import is taking longer than expected to complete. If this issue persists, please contact our support team for assistance.'
						) }
					</span>
					<InlineSupportLink supportLink={ supportLink } />
				</Notice>
			) }

			{ ! isUploading && (
				<label className="add-subscribers-modal__label">{ translate( 'Email' ) }</label>
			) }

			<AddSubscriberForm
				siteId={ site.ID }
				hasSubscriberLimit={ hasSubscriberLimit }
				submitBtnAlwaysEnable
				onImportStarted={ onImportStarted }
				onImportFinished={ onImportFinished }
				showTitle={ false }
				showSubtitle={ false }
				showCsvUpload={ isEnabled( 'subscriber-csv-upload' ) }
				recordTracksEvent={ recordTracksEvent }
				hidden={ isUploading }
				isWPCOMSite={ isWPCOMSite }
				disabled={ isImportInProgress }
			/>
		</Modal>
	);
};

export default AddSubscribersModal;
