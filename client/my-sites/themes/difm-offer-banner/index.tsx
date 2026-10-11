import Banner from 'calypso/components/banner';
import { getDifmOfferCopy, useDifmOffer } from 'calypso/dashboard/utils/difm-offer';
import { useDispatch, useSelector } from 'calypso/state';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference, hasReceivedRemotePreferences } from 'calypso/state/preferences/selectors';
import getCurrentLocaleSlug from 'calypso/state/selectors/get-current-locale-slug';
import { getSite } from 'calypso/state/sites/selectors';
import { isUpsellCardDisplayed } from 'calypso/state/themes/selectors';

const UPSELL_ID = 'themes-difm-offer';
const UPSELL_FEATURE_ID = 'difm-offer';
// Shared with the site overview card, so one dismissal hides the offer on every surface and site.
const DISMISSED_PREFERENCE = 'hosting-dashboard-difm-offer-dismissed';

interface DifmOfferBannerProps {
	siteId: number | null | undefined;
}

export default function DifmOfferBanner( { siteId }: DifmOfferBannerProps ) {
	const dispatch = useDispatch();
	const site = useSelector( ( state ) => getSite( state, siteId ) );
	const localeSlug = useSelector( getCurrentLocaleSlug ) ?? undefined;
	// The in-grid upsell card already offers DIFM, so hide this banner while it shows.
	const isUpsellCardShown = useSelector( isUpsellCardDisplayed );
	// Wait for remote preferences so a dismissed banner does not flash before they load.
	const hasPreferences = useSelector( hasReceivedRemotePreferences );
	const isDismissed = !! useSelector( ( state ) => getPreference( state, DISMISSED_PREFERENCE ) );

	const { isEligible, isLoading, variation } = useDifmOffer( {
		planSlug: site?.plan?.product_slug,
		siteCreatedAt: site?.options?.created_at,
		localeSlug,
		isA4ADevSite: site?.is_a4a_dev_site,
	} );

	const copy = getDifmOfferCopy( variation );

	if (
		! site ||
		! hasPreferences ||
		isDismissed ||
		isUpsellCardShown ||
		! isEligible ||
		isLoading ||
		! copy
	) {
		return null;
	}

	const tracksProperties = {
		upsell_id: UPSELL_ID,
		upsell_feature_id: UPSELL_FEATURE_ID,
		variation,
	};

	return (
		<Banner
			className="themes__difm-offer-banner"
			title={ copy.title }
			description={ copy.description }
			callToAction={ copy.ctaText }
			event={ UPSELL_ID }
			disableHref
			// The offer modal opens here in a follow-up.
			onClick={ () => {} }
			tracksImpressionProperties={ tracksProperties }
			tracksClickProperties={ tracksProperties }
			tracksDismissProperties={ tracksProperties }
			dismissWithoutSavingPreference
			onDismiss={ () =>
				dispatch( savePreference( DISMISSED_PREFERENCE, new Date().toISOString() ) )
			}
		/>
	);
}
