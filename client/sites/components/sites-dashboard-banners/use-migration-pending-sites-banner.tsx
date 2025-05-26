import { HelpCenter } from '@automattic/data-stores';
import { useDispatch as useDataStoreDispatch } from '@wordpress/data';
import { translate } from 'i18n-calypso';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { isCardDismissed } from 'calypso/blocks/dismissible-card/selectors';
import Banner from 'calypso/components/banner';
import type { Status } from '@automattic/sites/src/use-sites-list-grouping';

export function useMigrationPendingSitesBanner( { sitesStatuses }: { sitesStatuses: Status[] } ) {
	const id = 'migration-pending-sites';

	const migrationPendingSitesCount = sitesStatuses.find(
		( status ) => status.name === 'migration-pending'
	)?.count;
	const isMigrationBannerDismissed = useSelector( isCardDismissed( id ) );

	const HELP_CENTER_STORE = HelpCenter.register();

	const { setShowHelpCenter } = useDataStoreDispatch( HELP_CENTER_STORE );

	const openHelpCenter = useCallback( () => {
		setShowHelpCenter( true, false, { contextTerm: 'migration' } );
	}, [ setShowHelpCenter ] );

	return {
		id,
		shouldShow() {
			if ( isMigrationBannerDismissed ) {
				return false;
			}
			// Show banner when user has migration pending sites
			return migrationPendingSitesCount && migrationPendingSitesCount > 0;
		},
		render() {
			return (
				<Banner
					icon="info-outline"
					callToAction={ translate( 'Get help' ) }
					primaryButton={ false }
					className="sites-banner"
					description={ translate(
						"Let's solve it together. Reach out to our support team to get your migration started."
					) }
					dismissPreferenceName={ id }
					event="get-help"
					horizontal
					onClick={ openHelpCenter }
					target="_blank"
					title={ translate( 'Stuck on your migration?' ) }
					tracksClickName="calypso_sites_dashboard_migration_banner_click"
				/>
			);
		},
	};
}
