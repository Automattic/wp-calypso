import { useTranslate } from 'i18n-calypso';
import LayoutBanner from 'calypso/a8c-for-agencies/components/layout/banner';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference } from 'calypso/state/preferences/selectors';

const EARLY_ACCESS_BANNER_DISMISSED = 'a4a-agency-tier-early-access-banner-dismissed';

export default function EarlyAccessBanner() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const bannerDismissed = useSelector( ( state ) =>
		getPreference( state, EARLY_ACCESS_BANNER_DISMISSED )
	);

	const handleDismiss = () => {
		dispatch( savePreference( EARLY_ACCESS_BANNER_DISMISSED, true ) );
		dispatch( recordTracksEvent( 'calypso_a4a_agency_tier_early_access_banner_dismiss_click' ) );
	};

	if ( bannerDismissed ) {
		return null;
	}

	return (
		<LayoutBanner level="warning" onClose={ handleDismiss }>
			{ translate(
				"You've been granted early access to our new Agency Tier experience! While the official launch of our tiers is set for January 2025, you have the opportunity to explore and progress on your tier today."
			) }
		</LayoutBanner>
	);
}
