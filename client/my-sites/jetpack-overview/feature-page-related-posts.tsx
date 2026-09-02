import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { getSelectedSite, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { getPlanKey, getPlanTier, PLAN_DISPLAY_NAMES } from './feature-data';
import FeatureDetailLayout, { type Benefit } from './feature-detail-layout';

const BENEFITS: Benefit[] = [
	{
		icon: 'posts',
		title: 'Matched by content, not just category',
		body: 'Related posts are chosen based on the actual text of each article — so suggestions are genuinely relevant, not just from the same category.',
	},
	{
		icon: 'visible',
		title: 'More pages per visit',
		body: 'Showing relevant content at the end of an article is one of the most effective ways to reduce bounce rate and increase time on site.',
	},
	{
		icon: 'cog',
		title: 'Customisable display',
		body: 'Choose how many related posts to show and whether to include thumbnails and headlines — adapts to your theme automatically.',
	},
];

export default function RelatedPostsFeaturePage() {
	const translate = useTranslate();
	const site = useSelector( getSelectedSite );
	const siteSlug = useSelector( getSelectedSiteSlug ) ?? '';
	const currentPlan = useSelector( ( state ) => getCurrentPlan( state, site?.ID ) );

	const planTier = getPlanTier( currentPlan?.productSlug );
	const planKey = getPlanKey( planTier );

	const planCallout = translate( 'Related posts are included on your %(planName)s plan.', {
		args: { planName: PLAN_DISPLAY_NAMES[ planKey ] },
	} );

	return (
		<FeatureDetailLayout
			featureId="related-posts"
			icon="posts"
			title="Keep readers on your site with related posts"
			subtitle="Jetpack automatically displays relevant posts below each article, giving readers more to explore and naturally reducing bounce rate."
			benefits={ BENEFITS }
			planCallout={ String( planCallout ) }
			backPath={ `/jetpack-features/${ siteSlug }` }
		/>
	);
}
