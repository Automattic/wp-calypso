import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { getSelectedSite, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { getPlanKey, getPlanTier, PLAN_DISPLAY_NAMES } from './feature-data';
import FeatureDetailLayout, { type Benefit } from './feature-detail-layout';

const BENEFITS: Benefit[] = [
	{
		icon: 'video',
		title: 'No ads, ever',
		body: "Unlike YouTube embeds, VideoPress videos never show ads before or during playback — and there's no VideoPress branding suggesting viewers leave your site.",
	},
	{
		icon: 'time',
		title: 'Fast delivery from a global CDN',
		body: "Videos are delivered from Jetpack's CDN, not your server, so they load quickly for every visitor without eating into your hosting bandwidth.",
	},
	{
		icon: 'image',
		title: 'Beautiful, customisable player',
		body: 'The VideoPress player supports custom thumbnails, chapters, and subtitles — and adapts cleanly to any screen size.',
	},
];

export default function VideoPressFeaturePage() {
	const translate = useTranslate();
	const site = useSelector( getSelectedSite );
	const siteSlug = useSelector( getSelectedSiteSlug ) ?? '';
	const currentPlan = useSelector( ( state ) => getCurrentPlan( state, site?.ID ) );

	const planTier = getPlanTier( currentPlan?.productSlug );
	const planKey = getPlanKey( planTier );

	let planCallout;
	if ( planTier >= 2 ) {
		planCallout = translate( 'Your %(planName)s plan includes unlimited VideoPress hosting.', {
			args: { planName: PLAN_DISPLAY_NAMES[ planKey ] },
		} );
	} else if ( planTier === 1 ) {
		planCallout = translate(
			'Your %(planName)s plan includes 1 video up to 1 GB. Upgrade for unlimited.',
			{
				args: { planName: PLAN_DISPLAY_NAMES[ planKey ] },
			}
		);
	} else {
		planCallout = translate( 'VideoPress is available on the Personal plan and above.' );
	}

	return (
		<FeatureDetailLayout
			featureId="videopress"
			icon="video"
			title="Ad-free video, built into your site"
			subtitle="VideoPress gives you a fast, clean video player with no ads or third-party branding — and stores your videos off your server so they never slow your site down."
			benefits={ BENEFITS }
			planCallout={ String( planCallout ) }
			ctaLabel="Go to your media library"
			ctaPath={ `/media/${ siteSlug }` }
			backPath={ `/jetpack-features/${ siteSlug }` }
		/>
	);
}
