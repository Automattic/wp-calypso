/**
 * External dependencies
 */
import React, { ReactElement, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import { translate } from 'i18n-calypso';
import { Dialog } from '@automattic/components';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import Main from 'components/main';
import FormattedHeader from 'components/formatted-header';
import SpinnerButton from 'components/spinner-button';
import MaterialIcon from 'components/material-icon';
import PromoCard from 'components/promo-section/promo-card';
import WhatIsJetpack from 'components/jetpack/what-is-jetpack';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import useTrackCallback from 'lib/jetpack/use-track-callback';
import {
	getAutomatedTransferStatus,
	isEligibleForAutomatedTransfer,
	getEligibility,
	EligibilityData,
} from 'state/automated-transfer/selectors';
import { initiateThemeTransfer } from 'state/themes/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { transferStates } from 'state/automated-transfer/constants';
import QueryAutomatedTransferEligibility from 'components/data/query-atat-eligibility';
import {
	hasBlockingHold as hasBlockingHoldFunc,
	getBlockingMessages,
	HardBlockingNotice,
	default as HoldList,
} from 'blocks/eligibility-warnings/hold-list';
import WarningList from 'blocks/eligibility-warnings/warning-list';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import { localizeUrl } from 'lib/i18n-utils';

/**
 * Style dependencies
 */
import './style.scss';
import 'blocks/eligibility-warnings/style.scss';

/**
 * Asset dependencies
 */
import JetpackBackupSVG from 'assets/images/illustrations/jetpack-backup.svg';
import JetpackScanSVG from 'assets/images/illustrations/jetpack-scan.svg';

interface Props {
	product: 'backup' | 'scan';
}

interface BlockingHoldNoticeProps extends Props {
	siteId: number;
}

interface TransferFailureNoticeProps extends Props {
	// This gets the values of the object transferStates.
	transferStatus: typeof transferStates[ keyof typeof transferStates ];
}

const contentPerPrimaryProduct = {
	backup: {
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
		secondaryPromo: {
			title: translate( 'Jetpack Scan' ),
			icon: 'security',
			content: translate(
				'Automated scanning and one-click fixes to keep your site ahead of security threats.'
			),
		},
	},

	scan: {
		documentHeadTitle: 'Activate Jetpack Scan now',
		header: translate( 'Jetpack Scan' ),
		primaryPromo: {
			title: translate( 'We guard your site. You run your business.' ),
			image: { path: JetpackScanSVG },
			content: translate(
				'Scan gives you automated scanning and one-click fixes to keep your site ahead of security threats.'
			),
			promoCTA: {
				text: translate( 'Activate Jetpack Scan now' ),
				loadingText: translate( 'Activating Jetpack Scan' ),
			},
		},
		secondaryPromo: {
			title: translate( 'Jetpack Backup' ),
			icon: 'security',
			content: translate(
				'Backup gives you granular control over your site, with the ability to restore it to any previous state, and export it at any time.'
			),
		},
	},
};

function BlockingHoldNotice( { siteId, product }: BlockingHoldNoticeProps ): ReactElement | null {
	const content = React.useMemo( () => contentPerPrimaryProduct[ product ], [ product ] );
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
	product,
}: TransferFailureNoticeProps ): ReactElement | null {
	const content = React.useMemo( () => contentPerPrimaryProduct[ product ], [ product ] );
	if ( transferStatus !== transferStates.FAILURE && transferStatus !== transferStates.ERROR ) {
		return null;
	}

	const errorMessage = translate(
		'There is an issue activating %s. Please contact our support team for help.',
		{ args: [ content.header ] }
	);

	return (
		<Notice text={ errorMessage } showDismiss={ false } status="is-error">
			<NoticeAction href={ localizeUrl( 'https://wordpress.com/help/contact' ) } external>
				{ translate( 'Contact us' ) }
			</NoticeAction>
		</Notice>
	);
}

export default function WPCOMBusinessAT( { product }: Props ): ReactElement {
	const content = React.useMemo( () => contentPerPrimaryProduct[ product ], [ product ] );
	const siteId = useSelector( getSelectedSiteId ) as number;

	// Gets the site eligibility data.
	const isEligible = useSelector( ( state ) => isEligibleForAutomatedTransfer( state, siteId ) );
	const {
		eligibilityHolds: holds,
		eligibilityWarnings: warnings,
	}: EligibilityData = useSelector( ( state ) => getEligibility( state, siteId ) );
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

	// Handles dispatching automated transfer.
	const dispatch = useDispatch();
	const initiateAT = React.useCallback( () => {
		setShowDialog( false );
		dispatch( initiateThemeTransfer( siteId, null, '' ) );
	}, [ dispatch, siteId ] );
	const eventName =
		product === 'backup'
			? 'calypso_jetpack_backup_business_at'
			: 'calypso_jetpack_scan_business_at';
	const trackInitiateAT = useTrackCallback( initiateAT, eventName );

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
			<PageViewTracker path={ `/${ product }/:site` } title="Business Plan Automated Transfer" />

			<FormattedHeader
				id="wpcom-business-at-header"
				className="wpcom-business-at__header"
				headerText={ content.header }
				align="left"
				brandFont
			/>
			<BlockingHoldNotice siteId={ siteId } product={ product } />
			<TransferFailureNotice product={ product } transferStatus={ automatedTransferStatus } />
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
						loading={ automatedTransferStatus === transferStates.START }
						onClick={ initiateATOrShowWarnings }
						disabled={ cannotInitiateTransfer }
					/>
				</div>
			</PromoCard>

			<FormattedHeader
				id="wpcom-business-at-subheader"
				className="wpcom-business-at__subheader"
				headerText={ translate( 'Also included in the Business Plan' ) }
				align="left"
				isSecondary
				brandFont
			/>

			<PromoCard
				title={ content.secondaryPromo.title }
				image={
					<MaterialIcon
						icon={ content.secondaryPromo.icon }
						className="wpcom-business-at__secondary-promo-icon"
					/>
				}
			>
				<p>{ content.secondaryPromo.content }</p>
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
					<HoldList holds={ holds } context={ product } isPlaceholder={ false } />
				) }
				{ !! warnings?.length && <WarningList warnings={ warnings } context={ product } /> }
			</Dialog>
		</Main>
	);
}
