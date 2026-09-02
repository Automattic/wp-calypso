import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { getSelectedSite, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { getPlanKey, getPlanTier, PLAN_DISPLAY_NAMES } from './feature-data';
import FeatureDetailLayout, { type Benefit } from './feature-detail-layout';

const BENEFITS: Benefit[] = [
	{
		icon: 'mail',
		title: 'Every new post lands in their inbox',
		body: 'When you publish, Jetpack automatically sends a notification to all your email subscribers — no newsletters to write separately.',
	},
	{
		icon: 'user-add',
		title: 'One-click subscribing',
		body: 'The subscribe block and widget let visitors sign up with a single click. No account needed, no complex forms.',
	},
	{
		icon: 'stats-alt-2',
		title: 'Track your subscriber growth',
		body: 'See how your subscriber list is growing over time and understand which posts are driving new sign-ups.',
	},
];

export default function EmailSubscriptionsFeaturePage() {
	const translate = useTranslate();
	const site = useSelector( getSelectedSite );
	const siteSlug = useSelector( getSelectedSiteSlug ) ?? '';
	const currentPlan = useSelector( ( state ) => getCurrentPlan( state, site?.ID ) );

	const planTier = getPlanTier( currentPlan?.productSlug );
	const planKey = getPlanKey( planTier );

	const planCallout = translate( 'Email subscriptions are included on your %(planName)s plan.', {
		args: { planName: PLAN_DISPLAY_NAMES[ planKey ] },
	} );

	return (
		<FeatureDetailLayout
			featureId="email-subscriptions"
			icon="mail"
			title="Turn readers into subscribers"
			subtitle="Let visitors subscribe to your site by email so every new post lands in their inbox automatically — no RSS reader required."
			benefits={ BENEFITS }
			planCallout={ String( planCallout ) }
			ctaLabel="Manage subscribers"
			ctaPath={ `/people/email-followers/${ siteSlug }` }
			backPath={ `/jetpack-features/${ siteSlug }` }
		/>
	);
}
