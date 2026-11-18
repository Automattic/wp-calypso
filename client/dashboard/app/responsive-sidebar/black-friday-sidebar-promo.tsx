import { useBlackFriday2026Offer } from 'calypso/lib/promotions/use-black-friday-2026-offer';
import SidebarPromoCard from '../../agency/components/sidebar-promo/sidebar-promo-card';
import BlackFriday2026Artwork from '../../components/black-friday-2026-artwork';
import {
	getBlackFriday2026CardCopy,
	getBlackFriday2026SidebarHref,
} from '../../utils/black-friday-2026';
import { useAnalytics } from '../analytics';
import { useAppContext } from '../context';

/**
 * Sits outside the sidebar navigator, like `AgencySidebarPromo`. Agency
 * dashboards keep their own promo, so this only renders where neither applies.
 */
export function BlackFridaySidebarPromo() {
	const { supports } = useAppContext();
	const isAgency = !! ( supports.agency || supports.agencyClient );
	return isAgency ? null : <BlackFridaySidebarPromoCard />;
}

function BlackFridaySidebarPromoCard() {
	const { recordTracksEvent } = useAnalytics();
	const offer = useBlackFriday2026Offer();

	if ( ! offer ) {
		return null;
	}

	const { title, description, ctaLabel } = getBlackFriday2026CardCopy( offer );
	const eventProps = { discount_percent: offer.percent };

	return (
		<SidebarPromoCard
			id="bf2026-dashboard-sidebar-promo"
			media={ <BlackFriday2026Artwork percent={ offer.isLifecycle ? 30 : 25 } /> }
			title={ title }
			description={ description }
			cta={ { label: ctaLabel, href: getBlackFriday2026SidebarHref( offer ) } }
			onView={ () =>
				recordTracksEvent( 'calypso_bf2026_dashboard_sidebar_promo_view', eventProps )
			}
			onClick={ () =>
				recordTracksEvent( 'calypso_bf2026_dashboard_sidebar_promo_click', eventProps )
			}
		/>
	);
}
