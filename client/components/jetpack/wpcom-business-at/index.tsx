/**
 * External dependencies
 */
import React, { ReactElement } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { translate } from 'i18n-calypso';

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
import { EligibilityData, getAutomatedTransferStatus } from 'state/automated-transfer/selectors';
import { initiateThemeTransfer } from 'state/themes/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { transferStates } from 'state/automated-transfer/constants';

/**
 * Style dependencies
 */
import './style.scss';

/**
 * Asset dependencies
 */
import JetpackBackupSVG from 'assets/images/illustrations/jetpack-backup.svg';
import JetpackScanSVG from 'assets/images/illustrations/jetpack-scan.svg';

interface Props {
	product: 'backup' | 'scan';
	automatedTransferStatus: {
		eligibility: EligibilityData;
		fetchingStatus: boolean;
		status: typeof transferStates[ keyof typeof transferStates ];
	};
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

export default function WPCOMBusinessAT( { product }: Props ): ReactElement {
	const content = React.useMemo( () => contentPerPrimaryProduct[ product ], [ product ] );
	const siteId = useSelector( getSelectedSiteId );
	const dispatch = useDispatch();
	const initiateAT = React.useCallback( () => {
		dispatch( initiateThemeTransfer( siteId, null, null ) );
	}, [ dispatch, siteId ] );
	const eventName =
		product === 'backup'
			? 'calypso_jetpack_backup_business_at'
			: 'calypso_jetpack_scan_business_at';
	const trackInitiateAT = useTrackCallback( initiateAT, eventName );

	const automatedTransferStatus = useSelector( ( state ) =>
		getAutomatedTransferStatus( state, siteId )
	);

	return (
		<Main className="wpcom-business-at">
			<DocumentHead title={ content.documentHeadTitle } />
			<SidebarNavigation />
			<PageViewTracker path={ `/${ product }/:site` } title="Business Plan Automated Transfer" />

			<FormattedHeader
				id="wpcom-business-at-header"
				className="wpcom-business-at__header"
				headerText={ content.header }
				align="left"
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
						loading={ automatedTransferStatus === transferStates.START }
						onClick={ trackInitiateAT }
					/>
				</div>
			</PromoCard>

			<FormattedHeader
				id="wpcom-business-at-subheader"
				className="wpcom-business-at__subheader"
				headerText={ translate( 'Also included in the Business Plan' ) }
				align="left"
				isSecondary
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
		</Main>
	);
}
