import { recordTracksEvent } from '@automattic/calypso-analytics';
import { isEnabled } from '@automattic/calypso-config';
import { FEATURE_UNLIMITED_SUBSCRIBERS } from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { Gridicon, FlowQuestion } from '@automattic/components';
import { SiteDetails } from '@automattic/data-stores';
import { localizeUrl } from '@automattic/i18n-utils';
import { AddSubscriberForm, UploadSubscribersForm } from '@automattic/subscriber';
import { useHasStaleImportJobs } from '@automattic/subscriber/src/hooks/use-has-stale-import-jobs';
import { useInProgressState } from '@automattic/subscriber/src/hooks/use-in-progress-state';
import { ExternalLink, Modal, __experimentalVStack as VStack } from '@wordpress/components';
import { copy, upload, reusableBlock } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { LoadingBar } from 'calypso/components/loading-bar';
import Notice from 'calypso/components/notice';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { useSubscribersPage } from 'calypso/my-sites/subscribers/components/subscribers-page/subscribers-page-context';
import { isBusinessTrialSite } from 'calypso/sites-dashboard/utils';
import './style.scss';
import { useSelector } from 'calypso/state';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { AppState } from 'calypso/types';

type AddSubscribersModalProps = {
	site: SiteDetails;
};

const AddSubscribersModal = ( { site }: AddSubscribersModalProps ) => {
	const translate = useTranslate();
	const [ addingMethod, setAddingMethod ] = useState( '' );
	const { showAddSubscribersModal, setShowAddSubscribersModal, addSubscribersCallback } =
		useSubscribersPage();
	const hasUnlimitedSubscribers = useSelector( ( state: AppState ) =>
		siteHasFeature( state, site?.ID, FEATURE_UNLIMITED_SUBSCRIBERS )
	);
	const isJetpack = useSelector( ( state: AppState ) => isJetpackSite( state, site?.ID ) );
	const isSubscriberCsvUploadEnabled = isEnabled( 'subscriber-csv-upload' );
	// There is also a separate `importers/substack` flag but that refers to a separate Substack content importer.
	// This flag refers to Substack free/paid subscriber + content importer.
	const isSubstackSubscriberImporterEnabled = isEnabled( 'importers/newsletter' );

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
		setAddingMethod( '' );
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

	const trackAndSetAddingMethod = ( method: string ) => {
		recordTracksEvent( `calypso_subscribers_add_question`, {
			method,
		} );
		setAddingMethod( method );
	};

	const importFromSubstack = () => {
		recordTracksEvent( `calypso_subscribers_add_question`, {
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

	const renderLearnMoreLink = ( isJetpack: boolean | null ) => {
		// Jetpack sites
		if ( isJetpack ) {
			return (
				<ExternalLink
					href={ localizeUrl( 'https://jetpack.com/support/newsletter/import-subscribers/' ) }
				>
					{ translate( 'Learn more' ) }
				</ExternalLink>
			);
		}

		// WP.com sites
		return (
			<InlineSupportLink
				showIcon={ false }
				supportLink={ localizeUrl(
					'https://wordpress.com/support/launch-a-newsletter/import-subscribers-to-a-newsletter/'
				) }
				supportPostId={ 220199 }
			>
				{ translate( 'Learn more' ) }
			</InlineSupportLink>
		);
	};

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
						{ isSubscriberCsvUploadEnabled && (
							<FlowQuestion
								icon={ upload }
								title={ translate( 'Use a CSV file' ) }
								text={ translate( 'Upload a file with your existing subscribers list.' ) }
								onClick={ () => {
									trackAndSetAddingMethod( 'upload' );
								} }
							/>
						) }
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
							{ renderLearnMoreLink( isJetpack ) }
						</Notice>
					) }
					<label className="add-subscribers-modal__label">{ translate( 'Email' ) }</label>
					<AddSubscriberForm
						siteId={ site.ID }
						siteUrl={ site.URL }
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
							{ renderLearnMoreLink( isJetpack ) }
						</Notice>
					) }
					<UploadSubscribersForm
						siteId={ site.ID }
						siteUrl={ site.URL }
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
