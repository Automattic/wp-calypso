/**
 * External dependencies
 */
import React, { ReactElement } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import { localize, translate } from 'i18n-calypso';
import page from 'page';

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
import { getAutomatedTransferStatus } from 'state/automated-transfer/selectors';
import { initiateThemeTransfer } from 'state/themes/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { transferStates } from 'state/automated-transfer/constants';
import { successNotice } from 'state/notices/actions';
import { requestSite } from 'state/sites/actions';
import { getSiteSlug } from 'state/sites/selectors';
import QuerySiteSettings from 'components/data/query-site-settings';

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

function WPCOMBusinessAT( { product }: Props ): ReactElement {
	//todo: do we need the SiteSettings before this page load?

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
	const { COMPLETE, START } = transferStates;

	const automatedTransferStatus = useSelector( ( state ) =>
		getAutomatedTransferStatus( state, siteId )
	);

	if ( automatedTransferStatus === COMPLETE ) {
		dispatch(
			successNotice( translate( 'Jetpack features are now activated.' ), {
				id: 'jetpack-features-on',
				duration: 5000,
				displayOnNextPage: true,
			} )
		);

		dispatch( requestSite( siteId ) ).then( () => {
			// todo: Reload the section with the new siteSlug
			// page( `/${product}/${siteSlug}`);
			page.redirect( '/' );
		} );
	}

	return (
		<Main className="wpcom-business-at">
			<QuerySiteSettings siteId={ siteId } />
			<DocumentHead title={ content.documentHeadTitle } />
			<SidebarNavigation />
			<PageViewTracker path={ `/${ product }/:site` } title="Business Plan Upsell" />

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
						loading={ automatedTransferStatus === START }
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

const mapStateToProps = ( state ) => ( {
	siteSlug: getSiteSlug( state, getSelectedSiteId( state ) ),
} );

export default connect( mapStateToProps )( localize( WPCOMBusinessAT ) );
