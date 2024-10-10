import { Gridicon } from '@automattic/components';
import { HelpCenter } from '@automattic/data-stores';
import { localizeUrl, useHasEnTranslation } from '@automattic/i18n-utils';
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
	const hasEnTranslation = useHasEnTranslation();

	const { setShowHelpCenter } = useDataStoreDispatch( HELP_CENTER_STORE );

	const showA8CForAgenciesBanner = sitesCount >= 5;
	const migrationPendingSitesCount = sitesStatuses.find(
		( status ) => status.name === 'migration-pending'
	)?.count;

	const isMigrationBannerDismissed = useSelector(
		isCardDismissed( 'dismissible-card-migration-pending-sites' )
	);

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
					dismissPreferenceName="dismissible-card-migration-pending-sites"
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
