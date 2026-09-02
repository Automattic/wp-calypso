import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { getSelectedSite, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { getPlanKey, getPlanTier, PLAN_DISPLAY_NAMES } from './feature-data';
import FeatureDetailLayout, { type Benefit } from './feature-detail-layout';

const BENEFITS: Benefit[] = [
	{
		icon: 'search',
		title: 'Instant, accurate results',
		body: 'Powered by Elasticsearch, Jetpack Search finds the right content immediately — even when your site has thousands of posts and pages.',
	},
	{
		icon: 'list-checkmark',
		title: 'Filterable by category, tag, and more',
		body: 'Visitors can filter search results by category, tag, date, and custom fields — so they find exactly what they are looking for.',
	},
	{
		icon: 'time',
		title: 'Fast even on large sites',
		body: "WordPress's built-in search slows down as your site grows. Jetpack Search stays fast regardless of how much content you have.",
	},
];

export default function JetpackSearchFeaturePage() {
	const translate = useTranslate();
	const site = useSelector( getSelectedSite );
	const siteSlug = useSelector( getSelectedSiteSlug ) ?? '';
	const currentPlan = useSelector( ( state ) => getCurrentPlan( state, site?.ID ) );

	const planTier = getPlanTier( currentPlan?.productSlug );
	const planKey = getPlanKey( planTier );

	const planCallout =
		planTier >= 3
			? translate( 'Your %(planName)s plan includes Jetpack Search.', {
					args: { planName: PLAN_DISPLAY_NAMES[ planKey ] },
			  } )
			: translate( 'Jetpack Search is available on the Business plan and above.' );

	return (
		<FeatureDetailLayout
			featureId="jetpack-search"
			icon="search"
			title="Search that actually finds what visitors are looking for"
			subtitle="Jetpack Search replaces the default WordPress search with a fast, accurate, and filterable experience powered by Elasticsearch."
			benefits={ BENEFITS }
			planCallout={ String( planCallout ) }
			backPath={ `/jetpack-features/${ siteSlug }` }
		/>
	);
}
