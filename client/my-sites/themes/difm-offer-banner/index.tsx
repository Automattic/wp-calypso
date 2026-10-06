import Banner from 'calypso/components/banner';
import { getDifmOfferCopy, useDifmOffer } from 'calypso/dashboard/utils/difm-offer';
import { useSelector } from 'calypso/state';
import getCurrentLocaleSlug from 'calypso/state/selectors/get-current-locale-slug';
import { getSite } from 'calypso/state/sites/selectors';
import { isUpsellCardDisplayed } from 'calypso/state/themes/selectors';

const UPSELL_ID = 'themes-difm-offer';
const UPSELL_FEATURE_ID = 'difm-offer';

interface DifmOfferBannerProps {
	siteId: number | null | undefined;
}

export default function DifmOfferBanner( { siteId }: DifmOfferBannerProps ) {
	const site = useSelector( ( state ) => getSite( state, siteId ) );
	const localeSlug = useSelector( getCurrentLocaleSlug ) ?? undefined;
	// The in-grid upsell card already offers DIFM, so hide this banner while it shows.
	const isUpsellCardShown = useSelector( isUpsellCardDisplayed );

	const { isEligible, isLoading, variation } = useDifmOffer( {
		planSlug: site?.plan?.product_slug,
		siteCreatedAt: site?.options?.created_at,
		localeSlug,
		isA4ADevSite: site?.is_a4a_dev_site,
	} );

	const copy = getDifmOfferCopy( variation );

	if ( ! site || isUpsellCardShown || ! isEligible || isLoading || ! copy ) {
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
		/>
	);
}
