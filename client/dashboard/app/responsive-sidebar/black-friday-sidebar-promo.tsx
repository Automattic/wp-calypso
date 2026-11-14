import { __, sprintf } from '@wordpress/i18n';
import { Icon, tag } from '@wordpress/icons';
import {
	BLACK_FRIDAY_2026_DISCOUNT_PERCENT,
	BLACK_FRIDAY_2026_LANDING_URL,
	isBlackFriday2026Active,
} from 'calypso/lib/promotions/black-friday-2026';
import SidebarPromoCard from '../../agency/components/sidebar-promo/sidebar-promo-card';
import { useAnalytics } from '../analytics';
import { useAppContext } from '../context';

/**
 * Sits outside the sidebar navigator, like `AgencySidebarPromo`. Agency
 * dashboards keep their own promo, so this only renders where neither applies.
 */
export function BlackFridaySidebarPromo() {
	const { supports } = useAppContext();
	const { recordTracksEvent } = useAnalytics();

	if ( supports.agency || supports.agencyClient || ! isBlackFriday2026Active() ) {
		return null;
	}

	const percent = BLACK_FRIDAY_2026_DISCOUNT_PERCENT;
	/* translators: %(percent)d is the discount percentage, e.g. 25 */
	const title = sprintf( __( 'Black Friday: %(percent)d%% off annual plans' ), { percent } );
	const description = sprintf(
		/* translators: %(percent)d is the discount percentage, e.g. 25 */
		__( 'Upgrade today and pay %(percent)d%% less for your first year.' ),
		{ percent }
	);
	/* translators: %(percent)d is the discount percentage, e.g. 25 */
	const ctaLabel = sprintf( __( 'Get %(percent)d%% off' ), { percent } );

	return (
		<SidebarPromoCard
			id="bf2026-dashboard-sidebar-promo"
			icon={ <Icon icon={ tag } /> }
			title={ title }
			description={ description }
			cta={ { label: ctaLabel, href: BLACK_FRIDAY_2026_LANDING_URL } }
			onView={ () => recordTracksEvent( 'calypso_bf2026_dashboard_sidebar_promo_view' ) }
			onClick={ () => recordTracksEvent( 'calypso_bf2026_dashboard_sidebar_promo_click' ) }
		/>
	);
}
