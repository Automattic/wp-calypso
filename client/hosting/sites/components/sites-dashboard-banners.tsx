import { Gridicon } from '@automattic/components';
import { localizeUrl, useHasEnTranslation } from '@automattic/i18n-utils';
import { translate } from 'i18n-calypso';
import Banner from 'calypso/components/banner';
import type { SiteExcerptData } from '@automattic/sites';
import type { Status } from '@automattic/sites/src/use-sites-list-grouping';

type SitesDashboardBannersProps = {
	sitesStatuses: Status[];
	paginatedSites: SiteExcerptData[];
};

const SitesDashboardBanners = ( { sitesStatuses, paginatedSites }: SitesDashboardBannersProps ) => {
	const hasEnTranslation = useHasEnTranslation();

	const showA8CForAgenciesBanner = paginatedSites.length >= 5;
	const migrationPendingSitesCount = sitesStatuses.find(
		( status ) => status.name === 'migration-pending'
	)?.count;

	if ( migrationPendingSitesCount && migrationPendingSitesCount > 0 ) {
		return (
			<div className="sites-a8c-for-agencies-banner-container">
				<Banner
					icon="info-outline"
					callToAction={ translate( 'Get help' ) }
					primaryButton={ false }
					className="sites-a8c-for-agencies-banner"
					description={ translate(
						"Let's solve it together. Reach out to our support team to get your migration started."
					) }
					dismissPreferenceName="dismissible-card-a8c-for-agencies-sites"
					event="get-help"
					horizontal
					onClick={ () => {
						alert( 'Open help center!' );
					} }
					target="_blank"
					title={ translate( 'Stuck on your migration?' ) }
					tracksClickName="calypso_sites_dashboard_migration_banner_click"
				/>
			</div>
		);
	}

	if ( showA8CForAgenciesBanner ) {
		return (
			<div className="sites-a8c-for-agencies-banner-container">
				<Banner
					callToAction={ translate( 'Learn more {{icon/}}', {
						components: {
							icon: <Gridicon icon="external" />,
						},
					} ) }
					className="sites-a8c-for-agencies-banner"
					description={
						hasEnTranslation(
							"Earn up to 50% revenue share and get volume discounts on WordPress.com hosting when you migrate sites to our platform and promote Automattic's products to clients."
						)
							? translate(
									"Earn up to 50% revenue share and get volume discounts on WordPress.com hosting when you migrate sites to our platform and promote Automattic's products to clients."
							  )
							: translate(
									'Manage multiple WordPress sites from one place, get volume discounts on hosting products, and earn up to 50% revenue share when you migrate sites to our platform and refer our products to clients.'
							  )
					}
					dismissPreferenceName="dismissible-card-a8c-for-agencies-sites"
					event="learn-more"
					horizontal
					href={ localizeUrl( 'https://wordpress.com/for-agencies?ref=wpcom-sites-dashboard' ) }
					target="_blank"
					title={
						hasEnTranslation( "Building sites for customers? Here's how to earn more." )
							? translate( "Building sites for customers? Here's how to earn more." )
							: translate( 'Managing multiple sites? Meet our agency hosting' )
					}
					tracksClickName="calypso_sites_dashboard_a4a_banner_click"
				/>
			</div>
		);
	}

	return null;
};

export default SitesDashboardBanners;
