import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { getSelectedSite, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { getPlanKey, getPlanTier, PLAN_DISPLAY_NAMES } from './feature-data';
import FeatureDetailLayout, { type Benefit } from './feature-detail-layout';

const BENEFITS: Benefit[] = [
	{
		icon: 'stats-alt-2',
		title: 'See your traffic at a glance',
		body: 'Views, visitors, likes, and comments — all in one clean dashboard, updated daily.',
	},
	{
		icon: 'globe',
		title: 'Know where your visitors come from',
		body: 'Track search engines, referrers, and social networks to see which channels are driving growth.',
	},
	{
		icon: 'posts',
		title: 'Find your best content',
		body: 'Discover which posts and pages get the most attention, then write more of what your audience loves.',
	},
];

export default function SiteStatsFeaturePage() {
	const translate = useTranslate();
	const site = useSelector( getSelectedSite );
	const siteSlug = useSelector( getSelectedSiteSlug ) ?? '';
	const currentPlan = useSelector( ( state ) => getCurrentPlan( state, site?.ID ) );

	const planTier = getPlanTier( currentPlan?.productSlug );
	const planKey = getPlanKey( planTier );

	let planCallout;
	if ( planTier >= 3 ) {
		planCallout = translate( 'Your %(planName)s plan includes full stats history.', {
			args: { planName: PLAN_DISPLAY_NAMES[ planKey ] },
		} );
	} else if ( planTier >= 1 ) {
		planCallout = translate( 'Your %(planName)s plan shows the last 30 days of stats.', {
			args: { planName: PLAN_DISPLAY_NAMES[ planKey ] },
		} );
	} else {
		planCallout = translate(
			'Your Free plan shows the last 7 days of stats. Upgrade for longer history.'
		);
	}

	return (
		<FeatureDetailLayout
			featureId="site-stats"
			icon="stats-alt-2"
			title="Understand what's working on your site"
			subtitle="Jetpack Stats shows you who's reading, what they're reading, and where they're coming from — so you can make better decisions about your content."
			benefits={ BENEFITS }
			planCallout={ String( planCallout ) }
			ctaLabel="View your stats"
			ctaPath={ `/stats/${ siteSlug }` }
			backPath={ `/jetpack-features/${ siteSlug }` }
		/>
	);
}
