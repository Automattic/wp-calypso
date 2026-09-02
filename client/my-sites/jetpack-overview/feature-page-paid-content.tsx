import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { getSelectedSite, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { getPlanKey, getPlanTier, PLAN_DISPLAY_NAMES } from './feature-data';
import FeatureDetailLayout, { type Benefit } from './feature-detail-layout';

const BENEFITS: Benefit[] = [
	{
		icon: 'lock',
		title: 'Choose exactly what is gated',
		body: 'Apply a paywall to individual posts or pages, or set an entire category as members-only. It is completely flexible.',
	},
	{
		icon: 'visible',
		title: 'Teasers give free readers a reason to subscribe',
		body: 'Non-paying visitors see an excerpt of your content before hitting the paywall — enough to show value, enough to prompt a subscription.',
	},
	{
		icon: 'refresh',
		title: 'Works with your membership tiers',
		body: 'Combine with recurring payments to automatically grant content access based on membership level, without any manual work.',
	},
];

export default function PaidContentFeaturePage() {
	const translate = useTranslate();
	const site = useSelector( getSelectedSite );
	const siteSlug = useSelector( getSelectedSiteSlug ) ?? '';
	const currentPlan = useSelector( ( state ) => getCurrentPlan( state, site?.ID ) );

	const planTier = getPlanTier( currentPlan?.productSlug );
	const planKey = getPlanKey( planTier );

	const planCallout = translate( 'Paid content gating is included on your %(planName)s plan.', {
		args: { planName: PLAN_DISPLAY_NAMES[ planKey ] },
	} );

	return (
		<FeatureDetailLayout
			featureId="paid-content"
			icon="lock"
			title="Offer exclusive content to paying members"
			subtitle="Gate specific posts, pages, or downloads behind a paywall — free visitors see a teaser, paying members see everything."
			benefits={ BENEFITS }
			planCallout={ String( planCallout ) }
			ctaLabel="Manage paid content"
			ctaPath={ `/earn/${ siteSlug }` }
			backPath={ `/jetpack-features/${ siteSlug }` }
		/>
	);
}
