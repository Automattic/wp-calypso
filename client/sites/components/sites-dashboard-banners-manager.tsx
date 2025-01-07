import { HelpCenter } from '@automattic/data-stores';
import { useDispatch as useDataStoreDispatch } from '@wordpress/data';
import { translate } from 'i18n-calypso';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { isCardDismissed } from 'calypso/blocks/dismissible-card/selectors';
import Banner from 'calypso/components/banner';
import { useA8CForAgenciesSitesBanner } from './sites-dashboard-banners/use-a8c-for-agencies-sites-banner';
import { useRestoreSitesBanner } from './sites-dashboard-banners/use-restore-sites-reminder-banner';
import type { Status } from '@automattic/sites/src/use-sites-list-grouping';

const HELP_CENTER_STORE = HelpCenter.register();

type SitesDashboardBannersManagerProps = {
	sitesStatuses: Status[];
	sitesCount: number;
};

const SitesDashboardBannersManager = ( {
	sitesStatuses,
	sitesCount,
}: SitesDashboardBannersManagerProps ) => {
	const { setShowHelpCenter } = useDataStoreDispatch( HELP_CENTER_STORE );

	const migrationPendingSitesCount = sitesStatuses.find(
		( status ) => status.name === 'migration-pending'
	)?.count;

	const isMigrationBannerDismissed = useSelector( isCardDismissed( 'migration-pending-sites' ) );

	const openHelpCenter = useCallback( () => {
		setShowHelpCenter( true );
	}, [ setShowHelpCenter ] );

	// TODO: refactor banners to use this pattern
	// Define banners in priority order
	const banners = [ useRestoreSitesBanner(), useA8CForAgenciesSitesBanner( { sitesCount } ) ];

	if (
		migrationPendingSitesCount &&
		migrationPendingSitesCount > 0 &&
		// If the banner is dismissed, we don't want to return earlier to show the other banner.
		! isMigrationBannerDismissed
	) {
		return (
			<div className="sites-banner-container">
				<Banner
					icon="info-outline"
					callToAction={ translate( 'Get help' ) }
					primaryButton={ false }
					className="sites-banner"
					description={ translate(
						"Let's solve it together. Reach out to our support team to get your migration started."
					) }
					dismissPreferenceName="migration-pending-sites"
					event="get-help"
					horizontal
					onClick={ openHelpCenter }
					target="_blank"
					title={ translate( 'Stuck on your migration?' ) }
					tracksClickName="calypso_sites_dashboard_migration_banner_click"
				/>
			</div>
		);
	}

	// Return the first banner that should show
	for ( const banner of banners ) {
		if ( banner.shouldShow() ) {
			return <div className="sites-banner-container">{ banner.render() }</div>;
		}
	}

	return null;
};

export default SitesDashboardBannersManager;
