import { isSpacefastPromoEnabled } from '../spacefast/constants';
import SpacefastSidebarPromo from './spacefast';
import type { SidebarPromoTone } from './sidebar-promo-card';
import type { RecordTracksEvent } from '../../tiers/types';

/**
 * The promo slot at the bottom of the agency sidebar, in both the dashboard and
 * a8c-for-agencies. Swap the promo here; render nothing when there's none.
 */
export default function SidebarPromo( {
	tone,
	devToolsHref,
	recordTracksEvent,
}: {
	/** a8c-for-agencies' sidebar is dark; the dashboard's follows its color scheme. */
	tone?: SidebarPromoTone;
	/** The Dev tools page for hosts whose route differs from the dashboard's `/dev-tools`. */
	devToolsHref?: string;
	/** Injected so the dashboard and a8c-for-agencies can each pass their own analytics client. */
	recordTracksEvent: RecordTracksEvent;
} ) {
	if ( ! isSpacefastPromoEnabled() ) {
		return null;
	}
	return (
		<SpacefastSidebarPromo
			tone={ tone }
			devToolsHref={ devToolsHref }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
}
