import SpacefastSidebarPromo from './spacefast';
import type { RecordTracksEvent } from '../../tiers/types';

/**
 * The promo slot at the bottom of the agency sidebar, in both the dashboard and
 * a8c-for-agencies. Swap the promo here; render nothing when there's none.
 */
export default function SidebarPromo( {
	recordTracksEvent,
}: {
	/** Injected so the dashboard and a8c-for-agencies can each pass their own analytics client. */
	recordTracksEvent: RecordTracksEvent;
} ) {
	return <SpacefastSidebarPromo recordTracksEvent={ recordTracksEvent } />;
}
