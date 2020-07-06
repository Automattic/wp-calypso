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
import { Button } from '@automattic/components';
import { getSelectedSiteSlug } from 'state/ui/selectors';
import { preventWidows } from 'lib/formatting';
import DocumentHead from 'components/data/document-head';
import FormattedHeader from 'components/formatted-header';
import Main from 'components/main';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import PromoCard from 'components/promo-section/promo-card';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import useTrackCallback from 'lib/jetpack/use-track-callback';

/**
 * Asset dependencies
 */
import JetpackBackupSVG from 'assets/images/illustrations/jetpack-backup.svg';
import './style.scss';

const trackEventName = 'calypso_jetpack_backup_upsell';

export default function WPCOMUpsellPage(): ReactElement {
	const onUpgradeClick = useTrackCallback( undefined, trackEventName );
	const siteSlug = useSelector( getSelectedSiteSlug );

	return (
		<Main className="backup__main backup__wpcom-upsell">
			<DocumentHead title="Jetpack Backup" />
			<SidebarNavigation />
			<PageViewTracker path="/backup/:site" title="Backup" />

			<FormattedHeader
				headerText={ translate( 'Jetpack Backup' ) }
				id="backup-header"
				align="left"
				brandFont
			/>

			<PromoCard
				title={ preventWidows( translate( 'Get time travel for your site with Jetpack Backup' ) ) }
				image={ { path: JetpackBackupSVG } }
				isPrimary
			>
				<p>
					{ preventWidows(
						translate(
							'Backup gives you granular control over your site, with the ability to restore it to any previous state, and export it at any time.'
						)
					) }
				</p>

				<div className="backup__wpcom-ctas">
					<Button
						className="backup__wpcom-cta backup__wpcom-realtime-cta"
						href={ addQueryArgs( `/checkout/${ siteSlug }/jetpack_backup_realtime`, {
							redirect_to: window.location.href,
						} ) }
						onClick={ onUpgradeClick }
						selfTarget={ true }
						primary
					>
						{ translate( 'Get real-time backups' ) }
					</Button>
					<Button
						className="backup__wpcom-cta backup__wpcom-daily-cta"
						href={ addQueryArgs( `/checkout/${ siteSlug }/jetpack_backup_daily`, {
							redirect_to: window.location.href,
						} ) }
						onClick={ onUpgradeClick }
						selfTarget={ true }
					>
						{ translate( 'Get daily backups' ) }
					</Button>
				</div>
			</PromoCard>
		</Main>
	);
}
