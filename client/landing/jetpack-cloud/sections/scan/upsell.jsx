/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import SecurityIcon from 'landing/jetpack-cloud/components/security-icon';
import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import StatsFooter from 'landing/jetpack-cloud/components/stats-footer';
import Upsell from 'landing/jetpack-cloud/components/upsell';
import { getSelectedSiteSlug } from 'state/ui/selectors';
import { recordTracksEvent } from 'state/analytics/actions';

function ScanUpsellPage( props ) {
	return (
		<Main className="scan__main">
			<DocumentHead title="Scanner" />
			<SidebarNavigation />
			<PageViewTracker path="/scan/:site" title="Scanner Upsell" />
			<div className="scan__content">
				<Upsell
					headerText={ translate( 'Your site does not have scan' ) }
					bodyText={ translate(
						'Automatic scanning and one-click fixes keep your site one step ahead of security threats.'
					) }
					buttonLink={ `https://wordpress.com/checkout/jetpack_scan/${ props.siteSlug }` }
					onClick={ () => props.recordTracksEvent( 'cloud_scan_upsell_click' ) }
					iconComponent={ <SecurityIcon icon="info" /> }
				/>
			</div>
			<StatsFooter
				noticeText="Failing to plan is planning to fail. Regular backups ensure that should the worst happen, you are prepared. Jetpack Backups has you covered."
				noticeLink="https://jetpack.com/upgrade/backups"
			/>
		</Main>
	);
}

export default connect(
	( state ) => ( {
		siteSlug: getSelectedSiteSlug( state ),
	} ),
	{ recordTracksEvent }
)( ScanUpsellPage );
