import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { getSelectedSite, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { getPlanKey, getPlanTier, PLAN_DISPLAY_NAMES } from './feature-data';
import FeatureDetailLayout, { type Benefit } from './feature-detail-layout';

const BENEFITS: Benefit[] = [
	{
		icon: 'posts',
		title: 'Always shows what is popular right now',
		body: 'The widget pulls from live stats data and updates continuously — it always reflects your genuinely most-visited content.',
	},
	{
		icon: 'visible',
		title: 'Keeps visitors on your site longer',
		body: 'Surfacing your best content gives visitors a reason to keep reading, reducing bounce rate and increasing pages per visit.',
	},
	{
		icon: 'stats-alt-2',
		title: 'Powered by real visitor data',
		body: 'Top Posts uses the same data as your Jetpack Stats dashboard — not guesses based on comments or likes.',
	},
];

export default function TopPostsFeaturePage() {
	const translate = useTranslate();
	const site = useSelector( getSelectedSite );
	const siteSlug = useSelector( getSelectedSiteSlug ) ?? '';
	const currentPlan = useSelector( ( state ) => getCurrentPlan( state, site?.ID ) );

	const planTier = getPlanTier( currentPlan?.productSlug );
	const planKey = getPlanKey( planTier );

	const planCallout = translate( 'The Top Posts widget is included on your %(planName)s plan.', {
		args: { planName: PLAN_DISPLAY_NAMES[ planKey ] },
	} );

	return (
		<FeatureDetailLayout
			featureId="top-posts"
			icon="posts"
			title="Surface your most popular content automatically"
			subtitle="The Top Posts widget keeps your best-performing content visible to every visitor, driving more traffic to what your audience already loves."
			benefits={ BENEFITS }
			planCallout={ String( planCallout ) }
			backPath={ `/jetpack-features/${ siteSlug }` }
		/>
	);
}
