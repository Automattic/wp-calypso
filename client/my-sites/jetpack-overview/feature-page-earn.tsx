import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { getSelectedSite, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { getPlanKey, getPlanTier, PLAN_DISPLAY_NAMES } from './feature-data';
import FeatureDetailLayout, { type Benefit } from './feature-detail-layout';

const BENEFITS: Benefit[] = [
	{
		icon: 'heart',
		title: 'Accept donations',
		body: 'Add a donation button to any post or page and let your readers support your work directly — one-time or recurring.',
	},
	{
		icon: 'refresh',
		title: 'Sell recurring memberships',
		body: 'Charge a monthly or annual fee for access to your site or specific content, with automatic billing handled for you.',
	},
	{
		icon: 'visible',
		title: 'Gate premium content',
		body: 'Keep your best content behind a paywall — free readers see a teaser, paying members see everything.',
	},
];

export default function EarnFeaturePage() {
	const translate = useTranslate();
	const site = useSelector( getSelectedSite );
	const siteSlug = useSelector( getSelectedSiteSlug ) ?? '';
	const currentPlan = useSelector( ( state ) => getCurrentPlan( state, site?.ID ) );

	const planTier = getPlanTier( currentPlan?.productSlug );
	const planKey = getPlanKey( planTier );

	const planCallout = translate( 'Earning features are included on your %(planName)s plan.', {
		args: { planName: PLAN_DISPLAY_NAMES[ planKey ] },
	} );

	return (
		<FeatureDetailLayout
			featureId="earn"
			icon="money"
			title="Turn your audience into income"
			subtitle="Jetpack gives you the tools to monetise your site — whether you want to accept donations, sell memberships, or offer exclusive content to paying readers."
			benefits={ BENEFITS }
			planCallout={ String( planCallout ) }
			ctaLabel="Set up monetisation"
			ctaPath={ `/earn/${ siteSlug }` }
			backPath={ `/jetpack-features/${ siteSlug }` }
		/>
	);
}
