import { recordTracksEvent } from '@automattic/calypso-analytics';
import { isEnabled } from '@automattic/calypso-config';
import { FEATURE_UNLIMITED_SUBSCRIBERS } from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { Gridicon, FlowQuestion } from '@automattic/components';
import {
	AddSubscriberForm,
	UploadSubscribersForm,
	useHasStaleImportJobs,
	useInProgressState,
} from '@automattic/subscriber';
import { Modal, __experimentalVStack as VStack } from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import { copy, upload, reusableBlock } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { LoadingBar } from 'calypso/components/loading-bar';
import Notice from 'calypso/components/notice';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { useCompleteImportSubscribersTask } from 'calypso/my-sites/subscribers/hooks/use-complete-import-subscribers-task';
import { isBusinessTrialSite } from 'calypso/sites-dashboard/utils';
import { useSelector } from 'calypso/state';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { AppState } from 'calypso/types';
import { StaleImportJobsNotice } from './stale-job-notice';

import './style.scss';

const AddSubscribersModal = ( {
	isVisible,
	onClose,
	addSubscribersCallback,
	initialMethod = '',
}: {
	isVisible: boolean;
	onClose: () => void;
	addSubscribersCallback: () => void;
	initialMethod?: string;
} ) => {
	const site = useSelector( getSelectedSite );
	const translate = useTranslate();
	const [ addingMethod, setAddingMethod ] = useState( '' );
	const hasUnlimitedSubscribers = useSelector( ( state: AppState ) =>
		siteHasFeature( state, site?.ID, FEATURE_UNLIMITED_SUBSCRIBERS )
	);
	const isJetpack = useSelector( ( state: AppState ) => isJetpackSite( state, site?.ID ) );
	const completeImportSubscribersTask = useCompleteImportSubscribersTask();
	// There is also a separate `importers/substack` flag but that refers to a separate Substack content importer.
	// This flag refers to Substack free/paid subscriber + content importer.
	const isSubstackSubscriberImporterEnabled = isEnabled( 'importers/newsletter' );

	// Update addingMethod when initialMethod changes
	useEffect( () => {
		setAddingMethod( initialMethod );
	}, [ initialMethod ] );

	const modalTitle = translate( 'Add subscribers to %s', {
		args: [ site?.title || '' ],
		comment: "%s is the site's title",
	} );

	const [ isUploading, setIsUploading ] = useState( false );
	const onImportStarted = ( hasFile: boolean ) => {
		// Mark this task complete on starting the import, as relying on completion is unreliable
		// since we prompt users to navigate elsewhere while it completes.
		completeImportSubscribersTask();
		setIsUploading( hasFile );
	};

	const isImportInProgress = useInProgressState();
	const hasStaleImportJobs = useHasStaleImportJobs();

	const onImportFinished = () => {
		setIsUploading( false );
		setAddingMethod( '' );
		addSubscribersCallback();
	};

	if ( ! isVisible ) {
		return null;
	}

	const isFreeSite = site?.plan?.is_free ?? false;
	const isBusinessTrial = site ? isBusinessTrialSite( site ) : false;
	const hasSubscriberLimit = ( isFreeSite || isBusinessTrial ) && ! hasUnlimitedSubscribers;

	const trackAndSetAddingMethod = ( method: string ) => {
		recordTracksEvent( 'calypso_subscribers_add_question', {
			method,
		} );
		setAddingMethod( method );
	};

	const importFromSubstack = () => {
		recordTracksEvent( 'calypso_subscribers_add_question', {
			method: 'substack',
		} );
		if ( isJetpackCloud() ) {
			window.location.href = `https://wordpress.com/import/newsletter/substack/${
				site?.slug || site?.ID || ''
			}`;
		} else {
			page( `/import/newsletter/substack/${ site?.slug || site?.ID || '' }` );
		}
	};

	return (
		<Modal
			title={ modalTitle as string }
			onRequestClose={ () => {
				onClose();
				setAddingMethod( '' );
			} }
			overlayClassName="add-subscribers-modal"
		>
			{ addingMethod === '' && (
				<>
					<p>
						{ translate(
							'We’ll automatically clean duplicate, incomplete, outdated, or spammy emails to boost open rates and engagement.'
						) }
					</p>
					<VStack spacing="5">
						<FlowQuestion
							icon={ copy }
							title={ translate( 'Add subscribers manually' ) }
							text={ translate( 'Paste their emails to add them to your site.' ) }
							onClick={ () => {
								trackAndSetAddingMethod( 'manually' );
							} }
						/>
						<FlowQuestion
							icon={ upload }
							title={ translate( 'Use a CSV file' ) }
							text={ translate( 'Upload a file with your existing subscribers list.' ) }
							onClick={ () => {
								trackAndSetAddingMethod( 'upload' );
							} }
						/>
						{ isSubstackSubscriberImporterEnabled && (
							<FlowQuestion
								icon={ reusableBlock }
								title={ translate( 'Import from Substack' ) }
								text={
									isJetpack
										? translate( 'Quickly bring your free and paid subscribers.' )
										: translate( 'Quickly bring your subscribers (and even your content!).' )
								}
								onClick={ importFromSubstack }
							/>
						) }
					</VStack>
				</>
			) }

			{ addingMethod === 'manually' && (
				<>
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
							theme="light"
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
						<StaleImportJobsNotice isJetpack={ isJetpack } siteId={ site?.ID || null } />
					) }
					<label className="add-subscribers-modal__label">{ translate( 'Email' ) }</label>
					<AddSubscriberForm
						siteId={ site?.ID || 0 }
						siteUrl={ site?.URL }
						hasSubscriberLimit={ hasSubscriberLimit }
						submitBtnAlwaysEnable
						onImportStarted={ onImportStarted }
						onImportFinished={ onImportFinished }
						showTitle={ false }
						showSubtitle={ false }
						showCsvUpload={ false }
						recordTracksEvent={ recordTracksEvent }
						hidden={ isUploading }
						isWPCOMSite={ ! isJetpack }
						disabled={ isImportInProgress }
					/>
				</>
			) }

			{ addingMethod === 'upload' && (
				<>
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
							theme="light"
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
						<StaleImportJobsNotice isJetpack={ isJetpack } siteId={ site?.ID || null } />
					) }
					<UploadSubscribersForm
						siteId={ site?.ID || 0 }
						siteUrl={ site?.URL }
						hasSubscriberLimit={ hasSubscriberLimit }
						onImportStarted={ onImportStarted }
						onImportFinished={ onImportFinished }
						recordTracksEvent={ recordTracksEvent }
						hidden={ isUploading }
						disabled={ isImportInProgress }
						isWPCOMSite={ ! isJetpack }
					/>
				</>
			) }
		</Modal>
	);
};

export default AddSubscribersModal;
