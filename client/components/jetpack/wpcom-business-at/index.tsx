import { WPCOM_FEATURES_BACKUPS_SELF_SERVE } from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { CompactCard, Dialog } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import clsx from 'clsx';
import { translate } from 'i18n-calypso';
import { useCallback, useEffect, useState } from 'react';
import JetpackBackupSVG from 'calypso/assets/images/illustrations/jetpack-backup.svg';
import {
	default as HoldList,
	getBlockingMessages,
	HardBlockingNotice,
	hasBlockingHold as hasBlockingHoldFunc,
} from 'calypso/blocks/eligibility-warnings/hold-list';
import WarningList from 'calypso/blocks/eligibility-warnings/warning-list';
import DocumentHead from 'calypso/components/data/document-head';
import QueryAutomatedTransferEligibility from 'calypso/components/data/query-atat-eligibility';
import QuerySiteFeatures from 'calypso/components/data/query-site-features';
import FormattedHeader from 'calypso/components/formatted-header';
import WhatIsJetpack from 'calypso/components/jetpack/what-is-jetpack';
import Main from 'calypso/components/main';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import PromoCard from 'calypso/components/promo-section/promo-card';
import SpinnerButton from 'calypso/components/spinner-button';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import useTrackCallback from 'calypso/lib/jetpack/use-track-callback';
import WPCOMUpsellPage from 'calypso/my-sites/backup/wpcom-upsell';
import { useDispatch, useSelector } from 'calypso/state';
import { fetchAutomatedTransferStatus } from 'calypso/state/automated-transfer/actions';
import { transferStates } from 'calypso/state/automated-transfer/constants';
import {
	EligibilityData,
	getAutomatedTransferStatus,
	getEligibility,
	isEligibleForAutomatedTransfer,
} from 'calypso/state/automated-transfer/selectors';
import { autoConfigCredentials } from 'calypso/state/jetpack/credentials/actions';
import { errorNotice } from 'calypso/state/notices/actions';
import getRewindState from 'calypso/state/selectors/get-rewind-state';
import getFeaturesBySiteId from 'calypso/state/selectors/get-site-features';
import isRequestingSiteFeatures from 'calypso/state/selectors/is-requesting-site-features';
import isSiteWpcomAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { requestSite } from 'calypso/state/sites/actions';
import isJetpackSite from 'calypso/state/sites/selectors/is-jetpack-site';
import { initiateThemeTransfer } from 'calypso/state/themes/actions';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import type { RewindState } from 'calypso/state/data-layer/wpcom/sites/rewind/type';
import type { AppState } from 'calypso/types';

import './style.scss';
import 'calypso/blocks/eligibility-warnings/style.scss';

const { COMPLETE, START } = transferStates;

interface BlockingHoldNoticeProps {
	siteId: number;
	productName: string;
	suppressInstallNotice?: boolean;
}

// This gets the values of the object transferStates.
export type TransferStatus = ( typeof transferStates )[ keyof typeof transferStates ];

interface TransferFailureNoticeProps {
	transferStatus: TransferStatus | null;
	productName: string;
}

export interface AtomicContentSwitch {
	documentHeadTitle: string;
	header: string;
	primaryPromo: {
		image: { path: string };
		promoCTA: { loadingText: string; text: string };
		title: string;
		content: string;
	};
	getProductUrl: ( siteSlug: string ) => string;
	/** Optional hook for product-specific activation handling */
	onActivationResolved?: () => void;
}

const vaultpressContent: AtomicContentSwitch = {
	documentHeadTitle: translate( 'Activate Jetpack VaultPress Backup now' ) as string,
	header: translate( 'Jetpack VaultPress Backup' ) as string,
	primaryPromo: {
		title: translate( 'Get time travel for your site with Jetpack VaultPress Backup' ),
		image: { path: JetpackBackupSVG },
		content: translate(
			'VaultPress Backup gives you granular control over your site, with the ability to restore it to any previous state, and export it at any time.'
		),
		promoCTA: {
			text: translate( 'Activate Jetpack VaultPress Backup now' ),
			loadingText: translate( 'Activating Jetpack VaultPress Backup' ),
		},
	},

	getProductUrl: ( siteSlug: string ) => `/backup/${ siteSlug }`,
};

function BlockingHoldNotice( {
	siteId,
	productName,
	suppressInstallNotice = false,
}: BlockingHoldNoticeProps ) {
	const { eligibilityHolds: holds } = useSelector( ( state ) => getEligibility( state, siteId ) );
	if ( ! holds || suppressInstallNotice ) {
		return null;
	}

	// Get messages and override for the Jetpack product name.
	const blockingMessages = getBlockingMessages( translate );
	blockingMessages.BLOCKED_ATOMIC_TRANSFER.message = String(
		translate(
			'This site is currently not eligible for %s. Please contact our support team for help.',
			{ args: [ productName ] }
		)
	);

	return (
		<HardBlockingNotice
			translate={ translate }
			holds={ holds }
			blockingMessages={ blockingMessages }
		/>
	);
}

function TransferFailureNotice( { transferStatus, productName }: TransferFailureNoticeProps ) {
	if ( transferStatus !== transferStates.FAILURE && transferStatus !== transferStates.ERROR ) {
		return null;
	}

	const errorMessage = translate(
		'There is an issue activating %s. Please contact our support team for help.',
		{
			args: [ productName ],
			comment: '%s is a Jetpack product name like: Jetpack Backup, Jetpack Scan, Jetpack Anti-spam',
		}
	);

	return (
		<Notice text={ errorMessage } showDismiss={ false } status="is-error">
			<NoticeAction href={ localizeUrl( 'https://wordpress.com/help/contact' ) } external>
				{ translate( 'Contact us' ) }
			</NoticeAction>
		</Notice>
	);
}
const SITE_POLL_DELAY_MS = 3000;
const SITE_POLL_MAX_ATTEMPTS = 10;
export default function WPCOMBusinessAT( {
	content = vaultpressContent,
}: { content?: AtomicContentSwitch } = {} ) {
	const siteId = useSelector( getSelectedSiteId ) as number;
	const siteSlug = useSelector( getSelectedSiteSlug ) as string;
	const rewindState = useSelector( ( state: AppState ) =>
		getRewindState( state, siteId )
	) as RewindState;

	// Gets the site eligibility data.
	const isEligible = useSelector( ( state ) => isEligibleForAutomatedTransfer( state, siteId ) );
	const { eligibilityHolds: holds, eligibilityWarnings: warnings }: EligibilityData = useSelector(
		( state ) => getEligibility( state, siteId )
	);

	const automatedTransferStatus = useSelector( ( state ) =>
		getAutomatedTransferStatus( state, siteId )
	);

	// Check if there's a blocking hold.
	const cannotInitiateTransfer =
		! isEligible ||
		( holds && hasBlockingHoldFunc( holds ) ) ||
		automatedTransferStatus === transferStates.FAILURE ||
		automatedTransferStatus === transferStates.ERROR;

	// Gets state to control dialog and continue button.
	const [ showDialog, setShowDialog ] = useState( false );
	const onClose = () => setShowDialog( false );
	const [ isRewindActivating, setIsRewindActivating ] = useState( false );

	// Handles dispatching automated transfer.
	const dispatch = useDispatch();
	const initiateAT = useCallback( () => {
		setShowDialog( false );
		dispatch( initiateThemeTransfer( siteId, null, '', '', 'jetpack_product_activation' ) );
	}, [ dispatch, siteId ] );
	const trackInitiateAT = useTrackCallback( initiateAT, 'calypso_jetpack_backup_business_at' );

	const isJetpack = useSelector( ( state: AppState ) => isJetpackSite( state, siteId ) );
	const isAtomic = useSelector( ( state: AppState ) => isSiteWpcomAtomic( state, siteId ) );

	const rewindAtomicDeactivated = isAtomic && rewindState?.state === 'unavailable';

	const { getProductUrl, onActivationResolved } = content;

	useEffect( () => {
		if ( isRewindActivating && ! rewindAtomicDeactivated ) {
			setIsRewindActivating( false );
			// Notify product-specific callback when activation settles
			onActivationResolved?.();
		}
	}, [ isRewindActivating, rewindAtomicDeactivated, onActivationResolved ] );

	// Check if features are loaded
	const featuresNotLoaded = useSelector(
		( state ) =>
			null === getFeaturesBySiteId( state, siteId ) && ! isRequestingSiteFeatures( state, siteId )
	);

	// Check if the site has the backup restore feature
	const hasBackupFeature = useSelector( ( state ) =>
		siteHasFeature( state, siteId, WPCOM_FEATURES_BACKUPS_SELF_SERVE )
	);

	useEffect( () => {
		// Check if a reverted site still has the COMPLETE status
		if ( automatedTransferStatus === COMPLETE ) {
			// Try to refresh the transfer state
			dispatch( fetchAutomatedTransferStatus( siteId ) );
		}
	}, [] );

	// Poll for updated site data after transfer completes until site is recognized as Jetpack
	useEffect( () => {
		if ( automatedTransferStatus !== COMPLETE || isJetpack ) {
			return;
		}

		dispatch( requestSite( siteId ) );

		const intervalId = setInterval( () => {
			dispatch( requestSite( siteId ) );
		}, SITE_POLL_DELAY_MS );

		// Stop polling after max attempts to avoid indefinite requests
		const timeoutId = setTimeout( () => {
			clearInterval( intervalId );
			dispatch(
				errorNotice(
					translate(
						'Activation is taking longer than expected. Please refresh the page to try again.'
					),
					{ id: 'jetpack-activation-timeout' }
				)
			);
		}, SITE_POLL_DELAY_MS * SITE_POLL_MAX_ATTEMPTS );

		return () => {
			clearInterval( intervalId );
			clearTimeout( timeoutId );
		};
	}, [ automatedTransferStatus, isJetpack, dispatch, siteId ] );

	// Once the site is recognized as Jetpack after transfer, navigate to the product page
	useEffect( () => {
		if ( automatedTransferStatus !== COMPLETE || ! isJetpack ) {
			return;
		}

		onActivationResolved?.();
		// Full reload is needed so route middleware re-evaluates the site as Jetpack/Atomic.
		window.location.href = getProductUrl( siteSlug );
	}, [ automatedTransferStatus, isJetpack, onActivationResolved, getProductUrl, siteSlug ] );

	// If there are any issues, show a dialog.
	// Otherwise, kick off the transfer!
	const initiateATOrShowWarnings = () => {
		if ( 0 === warnings?.length && 0 === holds?.length ) {
			trackInitiateAT();
		} else {
			setShowDialog( true );
		}
	};

	// If features are not loaded yet, show loading state
	if ( featuresNotLoaded ) {
		return (
			<Main className="wpcom-business-at">
				<QuerySiteFeatures siteIds={ [ siteId ] } />
				<DocumentHead title={ content.documentHeadTitle } />
				<FormattedHeader
					id="wpcom-business-at-header"
					className="wpcom-business-at__header"
					headerText={ content.header }
					align="left"
					brandFont
				/>
				<div className="wpcom-business-at__loading">
					<p>{ translate( 'Loading…' ) }</p>
				</div>
			</Main>
		);
	}

	// If the site doesn't have the backup feature, show the upsell instead
	if ( ! hasBackupFeature ) {
		return <WPCOMUpsellPage />;
	}

	return (
		<Main className="wpcom-business-at">
			<QueryAutomatedTransferEligibility siteId={ siteId } />
			<DocumentHead title={ content.documentHeadTitle } />
			<PageViewTracker path="/backup/:site" title="Business Plan Automated Transfer" />

			<FormattedHeader
				id="wpcom-business-at-header"
				className="wpcom-business-at__header"
				headerText={ content.header }
				align="left"
				brandFont
			/>
			<BlockingHoldNotice
				siteId={ siteId }
				productName={ content.header }
				suppressInstallNotice={ rewindAtomicDeactivated }
			/>
			<TransferFailureNotice
				transferStatus={ automatedTransferStatus as TransferStatus }
				productName={ content.header }
			/>
			<PromoCard
				title={ content.primaryPromo.title }
				image={ content.primaryPromo.image }
				isPrimary
			>
				<p>{ content.primaryPromo.content }</p>
				<div className="wpcom-business-at__cta">
					<SpinnerButton
						text={ content.primaryPromo.promoCTA.text }
						loadingText={ content.primaryPromo.promoCTA.loadingText }
						loading={
							automatedTransferStatus === START ||
							( automatedTransferStatus === COMPLETE && ! isJetpack ) ||
							isRewindActivating
						}
						onClick={ () => {
							if ( rewindAtomicDeactivated ) {
								setIsRewindActivating( true );
								dispatch( autoConfigCredentials( siteId ) );
								page( content.getProductUrl( siteSlug ) );
								return;
							}
							initiateATOrShowWarnings();
						} }
						disabled={
							( cannotInitiateTransfer && ! rewindAtomicDeactivated ) || isRewindActivating
						}
					/>
				</div>
			</PromoCard>

			{ ! isJetpackCloud() && <WhatIsJetpack className="wpcom-business-at__footer" /> }

			<Dialog
				isVisible={ showDialog }
				onClose={ onClose }
				buttons={ [
					{ action: 'cancel', label: translate( 'Cancel' ) },
					{
						action: 'continue',
						label: translate( 'Continue' ),
						onClick: trackInitiateAT,
						isPrimary: true,
					},
				] }
				className={ clsx(
					'wpcom-business-at__dialog',
					'eligibility-warnings',
					'eligibility-warnings--without-title',
					{
						'eligibility-warnings--with-indent': warnings?.length,
					}
				) }
			>
				{ !! holds?.length && (
					<HoldList holds={ holds } context="backup" isPlaceholder={ false } />
				) }
				{ !! warnings?.length && (
					<CompactCard className="eligibility-warnings__warnings-card">
						<WarningList warnings={ warnings } context="backup" />
					</CompactCard>
				) }
			</Dialog>
		</Main>
	);
}
