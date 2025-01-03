import { Gridicon } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { translate } from 'i18n-calypso';
import Banner from 'calypso/components/banner';

export function useA8CForAgenciesSitesBanner( { sitesCount }: { sitesCount: number } ) {
	const id = 'dismissible-card-a8c-for-agencies-sites';

	return {
		id,
		shouldShow() {
			const showA8CForAgenciesBanner = sitesCount >= 5;
			return showA8CForAgenciesBanner;
		},
		render() {
			return (
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
			);
		},
	};
}
