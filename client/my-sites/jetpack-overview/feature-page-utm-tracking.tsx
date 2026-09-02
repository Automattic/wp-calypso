import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { getSelectedSite, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { getPlanKey, getPlanTier, PLAN_DISPLAY_NAMES } from './feature-data';
import FeatureDetailLayout, { type Benefit } from './feature-detail-layout';

const BENEFITS: Benefit[] = [
	{
		icon: 'stats-alt-2',
		title: 'See which campaigns are working',
		body: 'Track UTM parameters from every campaign — email, social, ads — and see exactly which ones are sending visitors to your site.',
	},
	{
		icon: 'globe',
		title: 'Detailed referrer data',
		body: 'Go beyond knowing someone came from Google. See the exact page, post, or campaign that linked to you.',
	},
	{
		icon: 'list-checkmark',
		title: 'Stop guessing, start deciding',
		body: 'When you know which channels drive traffic, you can invest more in what works and stop wasting time on what does not.',
	},
];

export default function UtmTrackingFeaturePage() {
	const translate = useTranslate();
	const site = useSelector( getSelectedSite );
	const siteSlug = useSelector( getSelectedSiteSlug ) ?? '';
	const currentPlan = useSelector( ( state ) => getCurrentPlan( state, site?.ID ) );

	const planTier = getPlanTier( currentPlan?.productSlug );
	const planKey = getPlanKey( planTier );

	const planCallout =
		planTier >= 3
			? translate( 'Your %(planName)s plan includes advanced referrers and UTM tracking.', {
					args: { planName: PLAN_DISPLAY_NAMES[ planKey ] },
			  } )
			: translate( 'Advanced UTM tracking is available on the Business plan and above.' );

	return (
		<FeatureDetailLayout
			featureId="utm-tracking"
			icon="stats-alt-2"
			title="Know exactly where your traffic is coming from"
			subtitle="Advanced UTM tracking and referrer data in Jetpack Stats shows you which campaigns, links, and sources are actually driving visitors to your site."
			benefits={ BENEFITS }
			planCallout={ String( planCallout ) }
			ctaLabel="View your stats"
			ctaPath={ `/stats/${ siteSlug }` }
			backPath={ `/jetpack-features/${ siteSlug }` }
		/>
	);
}
