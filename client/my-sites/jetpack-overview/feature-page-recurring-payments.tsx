import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { getSelectedSite, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { getPlanKey, getPlanTier, PLAN_DISPLAY_NAMES } from './feature-data';
import FeatureDetailLayout, { type Benefit } from './feature-detail-layout';

const BENEFITS: Benefit[] = [
	{
		icon: 'refresh',
		title: 'Automatic recurring billing',
		body: 'Jetpack handles all billing automatically — subscribers are charged on their chosen cycle with no manual work from you.',
	},
	{
		icon: 'money',
		title: 'Flexible pricing tiers',
		body: 'Create multiple membership levels at different price points so readers can choose the level of support that works for them.',
	},
	{
		icon: 'visible',
		title: 'Combine with paid content',
		body: 'Pair memberships with paid content gating to automatically give members exclusive access to posts, pages, or downloads.',
	},
];

export default function RecurringPaymentsFeaturePage() {
	const translate = useTranslate();
	const site = useSelector( getSelectedSite );
	const siteSlug = useSelector( getSelectedSiteSlug ) ?? '';
	const currentPlan = useSelector( ( state ) => getCurrentPlan( state, site?.ID ) );

	const planTier = getPlanTier( currentPlan?.productSlug );
	const planKey = getPlanKey( planTier );

	const planCallout = translate( 'Recurring payments are included on your %(planName)s plan.', {
		args: { planName: PLAN_DISPLAY_NAMES[ planKey ] },
	} );

	return (
		<FeatureDetailLayout
			featureId="recurring-payments"
			icon="refresh"
			title="Build a reliable income with recurring memberships"
			subtitle="Charge a monthly or annual fee for access to your site or specific content, with automatic billing handled by Jetpack and Stripe."
			benefits={ BENEFITS }
			planCallout={ String( planCallout ) }
			ctaLabel="Set up memberships"
			ctaPath={ `/earn/${ siteSlug }` }
			backPath={ `/jetpack-features/${ siteSlug }` }
		/>
	);
}
