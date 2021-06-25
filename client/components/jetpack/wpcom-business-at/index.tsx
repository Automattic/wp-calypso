/**
 * External dependencies
 */
import React, { ReactElement, useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import { translate } from 'i18n-calypso';
import { Dialog } from '@automattic/components';
import page from 'page';

/**
 * Internal dependencies
 */
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import FormattedHeader from 'calypso/components/formatted-header';
import SpinnerButton from 'calypso/components/spinner-button';
import PromoCard from 'calypso/components/promo-section/promo-card';
import WhatIsJetpack from 'calypso/components/jetpack/what-is-jetpack';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import useTrackCallback from 'calypso/lib/jetpack/use-track-callback';
import {
	getAutomatedTransferStatus,
	isEligibleForAutomatedTransfer,
	getEligibility,
	EligibilityData,
} from 'calypso/state/automated-transfer/selectors';
import { initiateThemeTransfer } from 'calypso/state/themes/actions';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { transferStates } from 'calypso/state/automated-transfer/constants';
import QueryAutomatedTransferEligibility from 'calypso/components/data/query-atat-eligibility';
import {
	hasBlockingHold as hasBlockingHoldFunc,
	getBlockingMessages,
	HardBlockingNotice,
	default as HoldList,
} from 'calypso/blocks/eligibility-warnings/hold-list';
import WarningList from 'calypso/blocks/eligibility-warnings/warning-list';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import { localizeUrl } from 'calypso/lib/i18n-utils';
import { successNotice } from 'calypso/state/notices/actions';
import { requestSite } from 'calypso/state/sites/actions';
import isJetpackSite from 'calypso/state/sites/selectors/is-jetpack-site';
import { fetchAutomatedTransferStatus } from 'calypso/state/automated-transfer/actions';

/**
 * Style dependencies
 */
import './style.scss';
import 'calypso/blocks/eligibility-warnings/style.scss';

/**
 * Asset dependencies
 */
import JetpackBackupSVG from 'calypso/assets/images/illustrations/jetpack-backup.svg';

interface BlockingHoldNoticeProps {
	siteId: number;
}

interface TransferFailureNoticeProps {
	// This gets the values of the object transferStates.
	transferStatus: typeof transferStates[ keyof typeof transferStates ];
}

const content = {
	documentHeadTitle: 'Activate Jetpack Backup now',
	header: translate( 'Jetpack Backup' ),
	primaryPromo: {
		title: translate( 'Get time travel for your site with Jetpack Backup' ),
		image: { path: JetpackBackupSVG },
		content: translate(
			'Backup gives you granular control over your site, with the ability to restore it to any previous state, and export it at any time.'
		),
		promoCTA: {
			text: translate( 'Activate Jetpack Backup now' ),
			loadingText: translate( 'Activating Jetpack Backup' ),
		},
	},
};

function BlockingHoldNotice( { siteId }: BlockingHoldNoticeProps ): ReactElement | null {
	const { eligibilityHolds: holds } = useSelector( ( state ) => getEligibility( state, siteId ) );
	if ( ! holds ) {
		return null;
	}

	// Get messages and override for the Jetpack product name.
	const blockingMessages = getBlockingMessages( translate );
	blockingMessages.BLOCKED_ATOMIC_TRANSFER.message = translate(
		'This site is currently not eligible for %s. Please contact our support team for help.',
		{ args: [ content.header ] }
	);

	return (
		<HardBlockingNotice
			translate={ translate }
			holds={ holds }
			blockingMessages={ blockingMessages }
		/>
	);
}

function TransferFailureNotice( {
	transferStatus,
}: TransferFailureNoticeProps ): ReactElement | null {
	if ( transferStatus !== transferStates.FAILURE && transferStatus !== transferStates.ERROR ) {
		return null;
	}

	const errorMessage = translate(
		'There is an issue activating %s. Please contact our support team for help.',
		{
			args: [ content.header ],
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

export default function WPCOMBusinessAT(): ReactElement {
	const siteId = useSelector( getSelectedSiteId ) as number;
	const siteSlug = useSelector( getSelectedSiteSlug ) as string;

	// Gets the site eligibility data.
	const isEligible = useSelector( ( state ) => isEligibleForAutomatedTransfer( state, siteId ) );
	const {
		eligibilityHolds: holds,
		eligibilityWarnings: warnings,
	}: EligibilityData = useSelector( ( state ) => getEligibility( state, siteId ) );

	const automatedTransferStatus = useSelector( ( state ) =>
		getAutomatedTransferStatus( state, siteId )
	);

	const { COMPLETE, START } = transferStates;

	// Check if there's a blocking hold.
	const cannotInitiateTransfer =
		! isEligible ||
		( holds && hasBlockingHoldFunc( holds ) ) ||
		automatedTransferStatus === transferStates.FAILURE ||
		automatedTransferStatus === transferStates.ERROR;

	// Gets state to control dialog and continue button.
	const [ showDialog, setShowDialog ] = useState( false );
	const onClose = () => setShowDialog( false );

	// Handles dispatching automated transfer.
	const dispatch = useDispatch();
	const initiateAT = useCallback( () => {
		setShowDialog( false );
		dispatch( initiateThemeTransfer( siteId, null, '' ) );
	}, [ dispatch, siteId ] );
	const trackInitiateAT = useTrackCallback( initiateAT, 'calypso_jetpack_backup_business_at' );

	const isJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );

	useEffect( () => {
		// Check if a reverted site still has the COMPLETE status
		if ( automatedTransferStatus === COMPLETE ) {
			// Try to refresh the transfer state
			dispatch( fetchAutomatedTransferStatus( siteId ) );
		}
	}, [] );

	useEffect( () => {
		if ( automatedTransferStatus !== COMPLETE ) {
			return;
		}
		// Transfer is completed, check if it's already a Jetpack site
		if ( ! isJetpack ) {
			// Need to refresh the site data.
			dispatch( requestSite( siteId ) );
			return;
		}

		// Okay, transfer is completed and it's a Jetpack site
		dispatch(
			successNotice(
				translate( '%s is now active', {
					args: content.header,
					comment:
						'%s is a Jetpack product name like: Jetpack Backup, Jetpack Scan, Jetpack Anti-spam',
				} ),
				{
					id: 'jetpack-features-on',
					duration: 5000,
					displayOnNextPage: true,
				}
			)
		);
		// Reload the page, whatever siteSlug is
		page( `/backup/${ siteSlug }` );
	}, [ automatedTransferStatus, isJetpack ] );

	// If there are any issues, show a dialog.
	// Otherwise, kick off the transfer!
	const initiateATOrShowWarnings = () => {
		if ( 0 === warnings?.length && 0 === holds?.length ) {
			trackInitiateAT();
		} else {
			setShowDialog( true );
		}
	};

	return (
		<Main className="wpcom-business-at">
			<QueryAutomatedTransferEligibility siteId={ siteId } />
			<DocumentHead title={ content.documentHeadTitle } />
			<SidebarNavigation />
			<PageViewTracker path={ `/backup/:site` } title="Business Plan Automated Transfer" />

			<FormattedHeader
				id="wpcom-business-at-header"
				className="wpcom-business-at__header"
				headerText={ content.header }
				align="left"
				brandFont
			/>
			<BlockingHoldNotice siteId={ siteId } />
			<TransferFailureNotice transferStatus={ automatedTransferStatus } />
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
							( automatedTransferStatus === COMPLETE && ! isJetpack )
						}
						onClick={ initiateATOrShowWarnings }
						disabled={ cannotInitiateTransfer }
					/>
				</div>
			</PromoCard>

			<WhatIsJetpack className="wpcom-business-at__footer" />

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
				className={ classNames( 'wpcom-business-at__dialog', 'eligibility-warnings', {
					'eligibility-warnings--with-indent': warnings?.length,
				} ) }
			>
				{ !! holds?.length && (
					<HoldList holds={ holds } context={ 'backup' } isPlaceholder={ false } />
				) }
				{ !! warnings?.length && <WarningList warnings={ warnings } context={ 'backup' } /> }
			</Dialog>
		</Main>
	);
}
