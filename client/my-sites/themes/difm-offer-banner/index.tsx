import Banner from 'calypso/components/banner';
import { getDifmOfferCopy, useDifmOffer } from 'calypso/dashboard/utils/difm-offer';
import { useSelector } from 'calypso/state';
import getCurrentLocaleSlug from 'calypso/state/selectors/get-current-locale-slug';
import { getSite } from 'calypso/state/sites/selectors';

const UPSELL_ID = 'themes-difm-offer';
const UPSELL_FEATURE_ID = 'difm-offer';

interface DifmOfferBannerProps {
	siteId: number | null | undefined;
}

export default function DifmOfferBanner( { siteId }: DifmOfferBannerProps ) {
	const site = useSelector( ( state ) => getSite( state, siteId ) );
	const localeSlug = useSelector( getCurrentLocaleSlug ) ?? undefined;

	const { isEligible, isLoading, variation } = useDifmOffer( {
		planSlug: site?.plan?.product_slug,
		siteCreatedAt: site?.options?.created_at,
		localeSlug,
	} );

	const copy = getDifmOfferCopy( variation );

	if ( ! site || ! isEligible || isLoading || ! copy ) {
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
