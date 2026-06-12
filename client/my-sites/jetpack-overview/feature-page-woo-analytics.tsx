import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { getSelectedSite, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { getPlanKey, getPlanTier, PLAN_DISPLAY_NAMES } from './feature-data';
import FeatureDetailLayout, { type Benefit } from './feature-detail-layout';

const BENEFITS: Benefit[] = [
	{
		icon: 'stats-alt-2',
		title: 'Revenue and orders at a glance',
		body: 'See your total revenue, average order value, and order volume over time — and spot trends as they emerge.',
	},
	{
		icon: 'user',
		title: 'Understand your customers',
		body: 'Know who your customers are, how often they buy, and what they spend. Identify your best customers and understand what keeps them coming back.',
	},
	{
		icon: 'posts',
		title: 'Find your top-performing products',
		body: 'See which products are selling best and which are not converting — so you can focus your merchandising where it actually counts.',
	},
];

export default function WooAnalyticsFeaturePage() {
	const translate = useTranslate();
	const site = useSelector( getSelectedSite );
	const siteSlug = useSelector( getSelectedSiteSlug ) ?? '';
	const currentPlan = useSelector( ( state ) => getCurrentPlan( state, site?.ID ) );

	const planTier = getPlanTier( currentPlan?.productSlug );
	const planKey = getPlanKey( planTier );

	const planCallout =
		planTier >= 3
			? translate(
					'Your %(planName)s plan includes WooCommerce analytics (requires WooCommerce to be active).',
					{ args: { planName: PLAN_DISPLAY_NAMES[ planKey ] } }
			  )
			: translate( 'WooCommerce analytics is available on the Business plan and above.' );

	return (
		<FeatureDetailLayout
			featureId="woo-analytics"
			icon="stats-alt-2"
			title="Understand what is driving your WooCommerce sales"
			subtitle="Jetpack brings deep WooCommerce analytics into your dashboard — revenue, orders, top products, and customer insights all in one place."
			benefits={ BENEFITS }
			planCallout={ String( planCallout ) }
			backPath={ `/jetpack-features/${ siteSlug }` }
		/>
	);
}
