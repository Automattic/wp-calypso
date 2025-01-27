import { Gridicon } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { translate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { isCardDismissed } from 'calypso/blocks/dismissible-card/selectors';
import Banner from 'calypso/components/banner';

export function useA8CForAgenciesSitesBanner( { sitesCount }: { sitesCount: number } ) {
	const id = 'dismissible-card-a8c-for-agencies-sites';
	const isA8CForAgenciesBannerDismissed = useSelector( isCardDismissed( id ) );

	return {
		id,
		shouldShow() {
			if ( isA8CForAgenciesBannerDismissed ) {
				return false;
			}
			// Show banner when user has 5 or more sites
			return sitesCount >= 5;
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
					dismissPreferenceName={ id }
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
