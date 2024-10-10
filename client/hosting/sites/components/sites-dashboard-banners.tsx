import { Gridicon } from '@automattic/components';
import { HelpCenter } from '@automattic/data-stores';
import { localizeUrl } from '@automattic/i18n-utils';
import { useDispatch as useDataStoreDispatch } from '@wordpress/data';
import { translate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { isCardDismissed } from 'calypso/blocks/dismissible-card/selectors';
import Banner from 'calypso/components/banner';
import type { Status } from '@automattic/sites/src/use-sites-list-grouping';

const HELP_CENTER_STORE = HelpCenter.register();

type SitesDashboardBannersProps = {
	sitesStatuses: Status[];
	sitesCount: number;
};

const SitesDashboardBanners = ( { sitesStatuses, sitesCount }: SitesDashboardBannersProps ) => {
	const { setShowHelpCenter } = useDataStoreDispatch( HELP_CENTER_STORE );

	const showA8CForAgenciesBanner = sitesCount >= 5;
	const migrationPendingSitesCount = sitesStatuses.find(
		( status ) => status.name === 'migration-pending'
	)?.count;

	const isMigrationBannerDismissed = useSelector( isCardDismissed( 'migration-pending-sites' ) );

	if (
		migrationPendingSitesCount &&
		migrationPendingSitesCount > 0 &&
		// If the banner is dismissed, we don't want to return earlier to show the other banner.
		! isMigrationBannerDismissed
	) {
		const ctaClickHandler = () => {
			setShowHelpCenter( true );
		};

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
					onClick={ ctaClickHandler }
					target="_blank"
					title={ translate( 'Stuck on your migration?' ) }
					tracksClickName="calypso_sites_dashboard_migration_banner_click"
				/>
			</div>
		);
	}

	if ( showA8CForAgenciesBanner ) {
		return (
			<div className="sites-banner-container">
				<Banner
					callToAction={ translate( 'Learn more {{icon/}}', {
						components: {
							icon: <Gridicon icon="external" />,
						},
					} ) }
					className="sites-banner"
					description={ translate(
						"Earn up to 50% revenue share and get volume discounts on WordPress.com hosting when you migrate sites to our platform and promote Automattic's products to clients."
					) }
					dismissPreferenceName="dismissible-card-a8c-for-agencies-sites"
					event="learn-more"
					horizontal
					href={ localizeUrl( 'https://wordpress.com/for-agencies?ref=wpcom-sites-dashboard' ) }
					target="_blank"
					title={ translate( "Building sites for customers? Here's how to earn more." ) }
					tracksClickName="calypso_sites_dashboard_a4a_banner_click"
				/>
			</div>
		);
	}

	return null;
};

export default SitesDashboardBanners;
