import { useState } from 'react';
import Banner from 'calypso/components/banner';
import { AnalyticsProvider } from 'calypso/dashboard/app/analytics';
import DifmOfferModal from 'calypso/dashboard/components/difm-offer-modal';
import { getDifmOfferCopy, useDifmOffer } from 'calypso/dashboard/utils/difm-offer';
import { useDifmOfferEngagementTracking } from 'calypso/dashboard/utils/use-difm-offer-engagement-tracking';
import { useAnalyticsClient } from 'calypso/sites/v2/hooks/use-analytics-client';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUserEmail } from 'calypso/state/current-user/selectors';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference, hasReceivedRemotePreferences } from 'calypso/state/preferences/selectors';
import getCurrentLocaleSlug from 'calypso/state/selectors/get-current-locale-slug';
import { getSite } from 'calypso/state/sites/selectors';
import { isUpsellCardDisplayed } from 'calypso/state/themes/selectors';
import thumbnailMobileUrl from './thumbnail-mobile.webp';
import thumbnailUrl from './thumbnail.webp';

import './style.scss';

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
	const userEmail = useSelector( getCurrentUserEmail );
	const analyticsClient = useAnalyticsClient( undefined, '/themes/:site' );
	const [ isModalOpen, setIsModalOpen ] = useState( false );

	const { isEligible, isLoading, variation } = useDifmOffer( {
		planSlug: site?.plan?.product_slug,
		siteCreatedAt: site?.options?.created_at,
		localeSlug,
		isA4ADevSite: site?.is_a4a_dev_site,
	} );

	const copy = getDifmOfferCopy( variation );

	const tracksProperties = {
		upsell_id: UPSELL_ID,
		upsell_feature_id: UPSELL_FEATURE_ID,
		variation,
	};
	const engagementRef = useDifmOfferEngagementTracking(
		( eventName, properties ) => dispatch( recordTracksEvent( eventName, properties ) ),
		tracksProperties
	);

	if (
		! site ||
		! hasPreferences ||
		isDismissed ||
		isUpsellCardShown ||
		! isEligible ||
		isLoading ||
		! copy ||
		variation === 'control'
	) {
		return null;
	}

	return (
		<>
			{ /* Banner does not forward a ref, so the wrapper holds it. */ }
			<div ref={ engagementRef }>
				<Banner
					className="themes__difm-offer-banner"
					title={ copy.title }
					description={ copy.description }
					callToAction={ copy.ctaText }
					// The thumbnail takes the place of the icon.
					showIcon={ false }
					primaryButton={ false }
					event={ UPSELL_ID }
					disableHref
					onClick={ () => setIsModalOpen( true ) }
					tracksImpressionProperties={ tracksProperties }
					tracksClickProperties={ tracksProperties }
					tracksDismissProperties={ tracksProperties }
					dismissWithoutSavingPreference
					onDismiss={ () =>
						dispatch( savePreference( DISMISSED_PREFERENCE, new Date().toISOString() ) )
					}
				>
					{ /* The mobile layout uses a taller crop of the thumbnail. */ }
					<picture className="themes__difm-offer-banner-image">
						<source media="(max-width: 480px)" srcSet={ thumbnailMobileUrl } />
						<img src={ thumbnailUrl } alt="" />
					</picture>
				</Banner>
			</div>
			{ isModalOpen && userEmail && (
				<AnalyticsProvider client={ analyticsClient }>
					<DifmOfferModal
						site={ site }
						userEmail={ userEmail }
						variation={ variation }
						source="themes"
						// Checkout returns to Themes on cancel, not to a dashboard page.
						cancelTo={ window.location.href }
						onClose={ () => setIsModalOpen( false ) }
					/>
				</AnalyticsProvider>
			) }
		</>
	);
}
