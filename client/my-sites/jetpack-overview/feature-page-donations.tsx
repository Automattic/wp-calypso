import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { getSelectedSite, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { getPlanKey, getPlanTier, PLAN_DISPLAY_NAMES } from './feature-data';
import FeatureDetailLayout, { type Benefit } from './feature-detail-layout';

const BENEFITS: Benefit[] = [
	{
		icon: 'heart',
		title: 'One-time payments, zero friction',
		body: 'Readers can support you with a single payment — no subscription commitment, no account required. Just click and pay.',
	},
	{
		icon: 'money',
		title: 'Suggested amounts you control',
		body: 'Set default donation amounts that make sense for your audience, while letting donors enter a custom amount if they choose.',
	},
	{
		icon: 'list-checkmark',
		title: 'No extra commission',
		body: "Jetpack only passes on Stripe's standard processing fee. There's no additional cut taken from your donations.",
	},
];

export default function DonationsFeaturePage() {
	const translate = useTranslate();
	const site = useSelector( getSelectedSite );
	const siteSlug = useSelector( getSelectedSiteSlug ) ?? '';
	const currentPlan = useSelector( ( state ) => getCurrentPlan( state, site?.ID ) );

	const planTier = getPlanTier( currentPlan?.productSlug );
	const planKey = getPlanKey( planTier );

	const planCallout = translate( 'Donation buttons are included on your %(planName)s plan.', {
		args: { planName: PLAN_DISPLAY_NAMES[ planKey ] },
	} );

	return (
		<FeatureDetailLayout
			featureId="donations"
			icon="heart"
			title="Let your readers support your work directly"
			subtitle="Add a donation button to any post or page and accept one-time payments from readers who want to support what you create."
			benefits={ BENEFITS }
			planCallout={ String( planCallout ) }
			ctaLabel="Set up donations"
			ctaPath={ `/earn/${ siteSlug }` }
			backPath={ `/jetpack-features/${ siteSlug }` }
		/>
	);
}
