/**
 * External dependencies
 */
import React, { ReactElement } from 'react';
import { translate } from 'i18n-calypso';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { addQueryArgs } from '@wordpress/url';
import { getSelectedSiteSlug, getSelectedSiteId } from 'state/ui/selectors';
import canCurrentUser from 'state/selectors/can-current-user';
import DocumentHead from 'components/data/document-head';
import FormattedHeader from 'components/formatted-header';
import Main from 'components/main';
import Notice from 'components/notice';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import PromoCard from 'components/promo-section/promo-card';
import PromoCardCTA from 'components/promo-section/promo-card/cta';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import useTrackCallback from 'lib/jetpack/use-track-callback';

/**
 * Asset dependencies
 */
import JetpackScanSVG from 'assets/images/illustrations/jetpack-scan.svg';
import './style.scss';

export default function WPCOMScanUpsellPage(): ReactElement {
	const onUpgradeClick = useTrackCallback( undefined, 'calypso_jetpack_scan_upsell' );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const siteId = useSelector( getSelectedSiteId );
	const isAdmin = useSelector( ( state ) => canCurrentUser( state, siteId, 'manage_options' ) );

	return (
		<Main className="scan scan__wpcom-upsell">
			<DocumentHead title="Scanner" />
			<SidebarNavigation />
			<PageViewTracker path="/scan/:site" title="Scanner" />

			<FormattedHeader
				headerText={ translate( 'Jetpack Scan' ) }
				id="scan-header"
				align="left"
				brandFont
			/>

			<PromoCard
				title={ translate( 'We guard your site. You run your business.' ) }
				image={ { path: JetpackScanSVG } }
				isPrimary
			>
				<p>
					{ translate(
						'Scan gives you automated scanning and one-click fixes ' +
							'to keep your site ahead of security threats.'
					) }
				</p>

				{ ! isAdmin && (
					<Notice
						status="is-warning"
						text={ translate( 'Only site administrators can upgrade to access daily scanning.' ) }
						showDismiss={ false }
					/>
				) }

				{ isAdmin && (
					<PromoCardCTA
						cta={ {
							text: translate( 'Get daily scanning' ),
							action: {
								url: addQueryArgs( `/checkout/${ siteSlug }/jetpack_scan`, {
									redirect_to: window.location.href,
								} ),
								onClick: onUpgradeClick,
								selfTarget: true,
							},
						} }
					/>
				) }
			</PromoCard>
		</Main>
	);
}
