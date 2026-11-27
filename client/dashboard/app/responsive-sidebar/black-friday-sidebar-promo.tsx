import { __, sprintf } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import {
	BLACK_FRIDAY_2026_COUPON,
	BLACK_FRIDAY_2026_DISCOUNT_PERCENT,
	BLACK_FRIDAY_2026_MONTHLY_SAVINGS_PERCENT,
	isBlackFriday2026Active,
} from 'calypso/lib/promotions/black-friday-2026';
import SidebarPromoCard from '../../agency/components/sidebar-promo/sidebar-promo-card';
import BlackFriday2026Artwork from '../../components/black-friday-2026-artwork';
import { wpcomLink } from '../../utils/link';
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
	const title = sprintf( __( '%(percent)d%% off annual and multi-year plans' ), { percent } );
	const description = sprintf(
		/* translators: %(savings)d is the largest saving compared with monthly billing, as a percentage, e.g. 66 */
		__( 'That’s up to %(savings)d%% less than paying monthly. Sale ends December 1.' ),
		{ savings: BLACK_FRIDAY_2026_MONTHLY_SAVINGS_PERCENT }
	);
	/* translators: %(percent)d is the discount percentage, e.g. 25 */
	const ctaLabel = sprintf( __( 'Get %(percent)d%% off' ), { percent } );
	const href = addQueryArgs( wpcomLink( '/setup/onboarding' ), {
		coupon: BLACK_FRIDAY_2026_COUPON,
	} );

	return (
		<SidebarPromoCard
			id="bf2026-dashboard-sidebar-promo"
			media={ <BlackFriday2026Artwork /> }
			title={ title }
			description={ description }
			cta={ { label: ctaLabel, href } }
			onView={ () => recordTracksEvent( 'calypso_bf2026_dashboard_sidebar_promo_view' ) }
			onClick={ () => recordTracksEvent( 'calypso_bf2026_dashboard_sidebar_promo_click' ) }
		/>
	);
}
